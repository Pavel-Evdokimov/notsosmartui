package GREETINGS

/**
 *  This is a good place to put documentation about your OSpace.
 */
public object GREETINGSRoot

	public		Object	Globals = GREETINGS::GREETINGSGlobals



	/**
	 *  Content Server Startup Code
	 */
	public function Void Startup()
		
			//
			// Initialize globals object
			//
		
			Object	globals = $GREETINGS = .Globals.Initialize()
		
			//
			// Initialize objects with __Init methods
			//
		
			$Kernel.OSpaceUtils.InitObjects( globals.f__InitObjs )
		
		end

end
