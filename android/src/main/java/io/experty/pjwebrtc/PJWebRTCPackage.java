package io.experty.pjwebrtc;

import android.app.Activity;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.JavaScriptModule;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public class PJWebRTCPackage implements ReactPackage {
    @Override
    public List<NativeModule> createNativeModules(
            ReactApplicationContext reactContext) {
        return Arrays.<NativeModule>asList(
                new PJWebRTCModule(reactContext)
        );
    }

    @Override
    public List<ViewManager> createViewManagers(
            ReactApplicationContext reactContext) {
        return Arrays.<ViewManager>asList(
                new PJRTCVideoViewManager()
        );
    }
}
