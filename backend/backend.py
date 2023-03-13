from YTools.network.server.server import start_server
import json

def helloresponse(request):
	return "hello"

if __name__ == "__main__":

    start_server(
        responsers = {
            "hello": helloresponse , 
        } , 
        encode = "json" , 
    )
