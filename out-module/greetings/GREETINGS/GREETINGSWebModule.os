package GREETINGS

public object GREETINGSWebModule inherits WEBDSP::WebModule

	override	List	fDependencies = { { 'kernel', 16, 0 }, { 'restapi', 16, 0 } }
	override	Boolean	fEnabled = TRUE
	override	String	fModuleName = 'greetings'
	override	String	fName = 'GREETINGS'
	override	List	fOSpaces = { 'greetings' }
	override	String	fSetUpQueryString = 'func=greetings.configure&module=greetings&nextUrl=%1'
	override	List	fVersion = { '1', '0', 'r', '0' }

end
