package com.phonegap.api;

public class CommandStatus {
	private int val;
	private String message;
	public CommandStatus(int val, String message) {
		this.val = val;
		this.message = message;
	}

	public int ordinal() {
		return this.val;
	}

	public String getMessage() {
		return message;
	}

	public static final CommandStatus OK = new CommandStatus(0, "OK");
	public static final CommandStatus CLASS_NOT_FOUND_EXCEPTION = new CommandStatus(1, "Class not found");
	public static final CommandStatus ILLEGAL_ACCESS_EXCEPTION = new CommandStatus(2, "Illegal access");
	public static final CommandStatus INSTANTIATION_EXCEPTION = new CommandStatus(3, "Instantiation error");
	public static final CommandStatus MALFORMED_URL_EXCEPTION = new CommandStatus(4, "Malformed url");
	public static final CommandStatus IO_EXCEPTION = new CommandStatus(5, "IO error");
	public static final CommandStatus INVALID_ACTION = new CommandStatus(6, "Invalid action");
	public static final CommandStatus JSON_EXCEPTION = new CommandStatus(7, "JSON error");
	public static final CommandStatus INVALID_ARGUMENT = new CommandStatus(8, "Invalid command argument");
}