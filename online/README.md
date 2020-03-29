# Aim:
- the algorithm aims to simulate a robot moving in an area, cleaning the places he visits and calculating the number of unique places he cleans during his path (with up to 10000 commands, coordinates between -100000 and 100000 and up to 100000 steps per command (which can go in all 4 directions (north,east,south,west)))

# We could add some initializer scripts to the postgresql database:
- to set up different users, of even to create the tables we need if we want to do that at startup
- however, I'd rather separate the database initialization from the tables initialization which are part of them, which is why I usually initialize tables in my db file when I'm opening the database

# For input checking, what I usually do is make a separate function which is called on input at the beginning of the request reception:
- I'm quite found of design by contract, however it's not this much implemented natively on modern languages (except in ACSL or other languages used for formal verification which are used so as to limit the use of unit tests in programs), but I tend to have habits to use similar principles
- I believe that when you read a function it should be clear what inputs are required even without documentation

# I separated my files following the classic MVC scheme:
- db.js for the Model
- executions.js for the Controller
- when I create a helper class I usually do it in a separate file (such as Point.class.js)
- executions.js is separated from main.js which receives the different inputs
- main.js acts as a global filter for every requests (setting the "content-type" header here since we are working with an application which returns json results)
- there is no real View since we return json output, but we could easily add some in a separate file if we wanted (changing the global filter however, or setting this parameter as a request parameter with a specific name which would enable us to use it in the global filter to set the return "content-type" header)

# I'm using a shell file to make scripts that are easily editable to build the docker

# More elaborated error management could be set in place for the database to give some return to user (with an "error" key in json for instance)

# Speaking of complexity (in worst cases):
- the algorithm isn't the most efficient in term of time complexity for the problem (since the best time complexity is O(max_commands*max_steps)), however the time complexity of O(max_commands*max_steps²) here enables use to have a space complexity of O(max_commands+max_steps) instead of O(max_commands*max_steps) (using a hashmap in the minimum time complexity case) which is interesting considering the practical values of max_commands and max_steps (knowing that the maximal number of elements in a Map() is 2²⁴ we would have reached it here, and circumvent it through the build of a BigMap class which would wrap several Maps wouldn't be that much of an efficient method except if we build a BigMap class where we give as parameter the number of Maps to build initially then using a hash we attribute new inputs to a unique map and we count them all at the end to reach the said best time complexity even in practice)

# ES6 modules:
- I'm using ES6 modules despite them still being experimental on Node.js because they are quite stable now and they have been there for a while now and are part of current good practices

# HTTP/2:
- The server is running HTTP/2, it is currently widely used on the web and it's quite efficient for complex requests to circumvents issues of HTTP/1.1 such as the need to open multiple TCP connections for some requests or having long headers uncompressed
- The server isn't running in HTTP/3 since it has yet to be fully implemented natively in Node.js (even if it is possible to use it through libraries)
- I'm note using either express nor request even if they are really popular libraries since request is deprecated and express is just a wrapper for underlying HTTP libraries of Node.js which aren't complicated to use and the use of native libraries can enable more precise control of the server
- I didn't use an encrypted connection with TLS since it wouldn't be that useful with a self-signed certificate however it must be used in practice since if used with a browser since there is no browser support for HTTP/2 without the https protocol

# For tests:
- It is possible to make some tests from Linux using command lines of the form (requires nghttp2 bundled with curl):
sudo curl -v --http2-prior-knowledge -X POST -H 'Content-Type: application/json' -d '{"start": {"x":10,"y":22}, "commands": [{ "direction": "east", "steps": 2 }, { "direction": "north", "steps": 1 }]}' http://localhost:5000/developer-test