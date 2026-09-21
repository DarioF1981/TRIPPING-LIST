package com.dariof1981.readygo;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.provider.DocumentsContract;
import androidx.activity.result.ActivityResult;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

// Plugin nativo per i backup:
// - save(): selettore "Salva come..." classico, un file alla volta (SAF ACTION_CREATE_DOCUMENT).
// - pickFolder(): l'utente sceglie/crea UNA VOLTA una cartella (es. "ReadyGo") e l'app
//   ottiene il permesso permanente di scriverci (SAF ACTION_OPEN_DOCUMENT_TREE + persistable permission).
// - saveToFolder(): scrive un nuovo file dentro quella cartella senza mostrare alcun selettore,
//   così i backup successivi sono completamente automatici.
@CapacitorPlugin(name = "SaveFile")
public class SaveFilePlugin extends Plugin {

    @PluginMethod
    public void save(PluginCall call) {
        String filename = call.getString("filename", "backup.json");
        String data = call.getString("data");
        String mimeType = call.getString("mimeType", "application/json");

        if (data == null) {
            call.reject("Dati mancanti");
            return;
        }

        Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType(mimeType);
        intent.putExtra(Intent.EXTRA_TITLE, filename);

        call.setKeepAlive(true);
        startActivityForResult(call, intent, "handleSaveResult");
    }

    @ActivityCallback
    private void handleSaveResult(PluginCall call, ActivityResult result) {
        if (call == null) return;

        if (result.getResultCode() != Activity.RESULT_OK) {
            call.reject("Salvataggio annullato");
            return;
        }

        Intent resultData = result.getData();
        if (resultData == null || resultData.getData() == null) {
            call.reject("Nessuna cartella/file selezionato");
            return;
        }

        Uri uri = resultData.getData();
        String content = call.getString("data");

        try (OutputStream os = getContext().getContentResolver().openOutputStream(uri)) {
            if (os == null) {
                call.reject("Impossibile aprire il file di destinazione");
                return;
            }
            os.write(content.getBytes(StandardCharsets.UTF_8));
            os.flush();

            JSObject ret = new JSObject();
            ret.put("uri", uri.toString());
            call.resolve(ret);
        } catch (IOException e) {
            call.reject("Errore durante la scrittura del file: " + e.getMessage());
        }
    }

    @PluginMethod
    public void pickFolder(PluginCall call) {
        Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT_TREE);
        call.setKeepAlive(true);
        startActivityForResult(call, intent, "handlePickFolderResult");
    }

    @ActivityCallback
    private void handlePickFolderResult(PluginCall call, ActivityResult result) {
        if (call == null) return;

        if (result.getResultCode() != Activity.RESULT_OK) {
            call.reject("Selezione cartella annullata");
            return;
        }

        Intent resultData = result.getData();
        if (resultData == null || resultData.getData() == null) {
            call.reject("Nessuna cartella selezionata");
            return;
        }

        Uri treeUri = resultData.getData();
        int takeFlags = Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION;
        try {
            getContext().getContentResolver().takePersistableUriPermission(treeUri, takeFlags);
        } catch (SecurityException e) {
            call.reject("Impossibile ottenere il permesso permanente sulla cartella: " + e.getMessage());
            return;
        }

        JSObject ret = new JSObject();
        ret.put("uri", treeUri.toString());
        call.resolve(ret);
    }

    @PluginMethod
    public void saveToFolder(PluginCall call) {
        String treeUriStr = call.getString("treeUri");
        String filename = call.getString("filename", "backup.json");
        String data = call.getString("data");
        String mimeType = call.getString("mimeType", "application/json");

        if (treeUriStr == null || data == null) {
            call.reject("Parametri mancanti");
            return;
        }

        try {
            Uri treeUri = Uri.parse(treeUriStr);
            Uri dirDocUri = DocumentsContract.buildDocumentUriUsingTree(
                treeUri, DocumentsContract.getTreeDocumentId(treeUri));
            Uri newFileUri = DocumentsContract.createDocument(
                getContext().getContentResolver(), dirDocUri, mimeType, filename);

            if (newFileUri == null) {
                call.reject("Impossibile creare il file nella cartella scelta");
                return;
            }

            try (OutputStream os = getContext().getContentResolver().openOutputStream(newFileUri)) {
                if (os == null) {
                    call.reject("Impossibile aprire il file appena creato");
                    return;
                }
                os.write(data.getBytes(StandardCharsets.UTF_8));
                os.flush();
            }

            JSObject ret = new JSObject();
            ret.put("uri", newFileUri.toString());
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Errore durante il salvataggio: " + e.getMessage());
        }
    }
}
