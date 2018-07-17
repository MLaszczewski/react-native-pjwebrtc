package io.experty.pjwebrtc;

import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

class PJWebRTCModule extends ReactContextBaseJavaModule implements PjWebRTC.MessageListener {

    public PJWebRTCModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "PJWebRTCModule";
    }

    @Override
    public void initialize() {
        PjWebRTC.addMessageListener(this);
    }

    @Override
    public boolean canOverrideExistingModule() {
        return false;
    }

    @Override
    public void onCatalystInstanceDestroy() {

    }

    @ReactMethod
    public void postMessage(String json) {
        PjWebRTC.pushMessage(json);
    }

    @Override
    public void onMessage(String message) {
        Log.d("RNM", "NATIVE MESSAGE: "+message);
        WritableMap params = Arguments.createMap();
        params.putString("message", message);
        getReactApplicationContext()
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit("PJWebRTCMessage", message);
    }

}
