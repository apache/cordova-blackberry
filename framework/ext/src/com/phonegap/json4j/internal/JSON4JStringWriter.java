/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2011, IBM Corporation
 */

package com.phonegap.json4j.internal;

import java.io.IOException;
import java.io.Writer;

public class JSON4JStringWriter extends Writer {

    public static int BUF_SIZE = 10000;

    private char[] _buffer = null;

    private int _mark = 0;

    public JSON4JStringWriter() {
        _buffer = new char[BUF_SIZE];
        _mark = 0;
    }

    // Resizes an array; doubles up every time.
    public static char[] resizeArray(char[] expandMe) {
        int newSize = expandMe.length * 2;
        char[] newArray = new char[newSize];
        System.arraycopy(expandMe, 0, newArray, 0, expandMe.length);
        return newArray;
    }


    public void close() throws IOException {
        return;
    }

    public void flush() throws IOException {
        return;
    }

    public void write(char[] cbuf, int off, int len) throws IOException {
        if (((len - off) + _mark) >= _buffer.length) {
            // Resize the array first.
            _buffer = JSON4JStringWriter.resizeArray(_buffer);
        }
        for (int x=0; x < len; x++) {
            _buffer[_mark] = cbuf[off+x];
            _mark++;
        }
    }

    public String toString() {
        return new String(_buffer, 0, _mark);
    }
}
