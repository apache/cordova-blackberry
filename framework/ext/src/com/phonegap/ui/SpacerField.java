package com.phonegap.ui;

import net.rim.device.api.ui.Field;
import net.rim.device.api.ui.Graphics;

public class SpacerField extends Field {

    int width;
    int height;

    public SpacerField(int width, int height) {
        super(NON_FOCUSABLE);
        this.width = width;
        this.height = height;
    }

    protected void layout(int width, int height) {
        this.setExtent(this.width, this.height);
    }

    protected void paint(Graphics graphics) {
        // uh, it's empty
    }

    public int getPreferredWidth() {
        return this.width;
    }

    public int getPreferredHeight() {
        return this.height;
    }
}
