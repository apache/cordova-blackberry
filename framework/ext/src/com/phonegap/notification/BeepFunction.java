package com.phonegap.notification;

import net.rim.device.api.script.ScriptableFunction;
import net.rim.device.api.system.Alert;

public final class BeepFunction extends ScriptableFunction {

	private static final int BEEP_VOLUME = 99;
	private static final int TUNE_LENGTH = 4;
	
	private static final short TUNE_NOTE                = 440; // A (440Hz)
	private static final short TUNE_NOTE_DURATION       = 500;
	private static final short FREQUENCY_PAUSE_DURATION = 0;
	private static final short TUNE_PAUSE_DURATION      = 50;
	
	private static final short[] TUNE = new short[] {
		TUNE_NOTE,
		TUNE_NOTE_DURATION,
		FREQUENCY_PAUSE_DURATION,
		TUNE_PAUSE_DURATION,
	};
	
	public Object invoke(Object obj, Object[] args) throws Exception {
		
		if (Alert.isAudioSupported()) {
			int repeatCount = (args.length >= 1) ? (((Integer)args[0]).intValue()) : 1;
			
			Alert.startAudio(getTune(repeatCount), BEEP_VOLUME);
		}
		
		return UNDEFINED;
	}
	
	private short[] getTune(int repeatCount) {
		short[] tune = new short[TUNE_LENGTH * repeatCount];
		
		for (int i = 0; i < repeatCount; i++) {
			System.arraycopy(TUNE, 0, tune, TUNE_LENGTH * i, TUNE_LENGTH);
		}
		
		return tune;
	}
}
