package com.phonegap.notification;

import net.rim.device.api.ui.DrawStyle;
import net.rim.device.api.ui.Field;
import net.rim.device.api.ui.FieldChangeListener;
import net.rim.device.api.ui.component.ButtonField;
import net.rim.device.api.ui.component.LabelField;
import net.rim.device.api.ui.component.SeparatorField;
import net.rim.device.api.ui.container.PopupScreen;
import net.rim.device.api.ui.container.VerticalFieldManager;

public final class CustomDialog extends PopupScreen implements FieldChangeListener {

	ButtonField button;
	
	/**
	 * Open a custom alert dialog, with a customizable title and button text.
	 * @param {String} message Message to print in the body of the alert
	 * @param {String} [title="Alert"] Title of the alert dialog (default: Alert)
	 * @param {String} [buttonLabel="OK"] Label of the close button (default: OK)
	 */
	public CustomDialog(String message, String title, String buttonLabel) {
		super(new VerticalFieldManager());
		
		// title
		if (title == null || title.length() == 0) { 
			title = "Alert";
		}
		add(new LabelField(title));
		
		// separator
		add(new SeparatorField(SeparatorField.LINE_HORIZONTAL));
		
		// message
		add(new LabelField(message, DrawStyle.HCENTER));

		// button
		if (buttonLabel == null || buttonLabel.length() == 0) {
			buttonLabel = "OK";
		}
		button = new ButtonField(buttonLabel, ButtonField.CONSUME_CLICK | FIELD_HCENTER);
		button.setChangeListener(this);
		add(button);
	}
	
	public void fieldChanged(Field field, int context) {
		if (button == field) {
			close();
		}
	}
}
