package GREETINGS

public object GREETINGSGlobals inherits KERNEL::Globals

	override	List	f__InitObjs = { \
											GREETINGS::GREETINGSWebModule, \
											GREETINGS::CSUIExtension, \
											GREETINGS::GREETINGSRequestHandlerGroup \
										}

end
