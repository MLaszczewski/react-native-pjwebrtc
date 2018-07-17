package io.experty.pjwebrtc;

import android.text.TextUtils;
import android.util.Log;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.HashMap;
import java.util.HashSet;
import java.util.concurrent.BlockingDeque;
import java.util.concurrent.LinkedBlockingDeque;

public class PjWebRTC {
    public static native void init();
    public static native void pushMessage(String json);
    public static native String getNextMessage(long wait);

    public static Thread readerThread;
    public static Thread writerThread;

    public static boolean initialized;
    public static boolean finished;

    public static BlockingDeque<String> sendQueue = new LinkedBlockingDeque<>();

    public interface MessageListener {
        void onMessage(String message);
    }

    public static HashSet<MessageListener> messageListeners = new HashSet<MessageListener>();

    static {
        initialized = false;
        System.loadLibrary("pjwebrtc");
        readerThread = new Thread() {
            public void run() {
                PjWebRTC.init();
                initialized = true;
                while(!finished) {
                    String strMsg = PjWebRTC.getNextMessage(100);
                    if(TextUtils.isEmpty(strMsg)) continue;
                    Log.d("PJWEBRTC", "MESSAGE:\n"+strMsg);
                    for(MessageListener listener : messageListeners) {
                        listener.onMessage(strMsg);
                    }
                }
            }
        };
        readerThread.start();

        writerThread = new Thread() {
            public void run() {
                while(!initialized) try {
                    Thread.sleep(10);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
                while(!finished) {
                    try {
                        String msg = sendQueue.takeFirst();
                        PjWebRTC.pushMessage(msg);
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                }
            }
        };
        writerThread.start();
    }

    public static void postMessage(String message) {
        sendQueue.addLast(message);
    }

    public static void addMessageListener(MessageListener listener) {
        messageListeners.add(listener);
    }
    public static void removeMessageListener(MessageListener listener) {
        messageListeners.remove(listener);
    }
}
