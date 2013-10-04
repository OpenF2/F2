# AMD
- Should our 3rd party libs be 1st class AMD modules? I'm thinking no, because it exposes our implementation and adds another layer of API we might need to maintain.

# EventEmitter
- Do we want to replace EventEmitter2 for a lightweight alternative?
	- It's not terribly large (~570 lines) but I have to believe it could be smaller