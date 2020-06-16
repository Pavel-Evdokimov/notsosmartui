package GREETINGS

public object Configure inherits WEBADMIN::AdminRequestHandler::Configure

	override	Boolean	fEnabled = TRUE
	override	String	fFuncPrefix = 'greetings'

end
