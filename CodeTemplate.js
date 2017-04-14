$(document).ready(function(){
	
document.body.onmousedown = function() { return false; } //so page is unselectable

	//Canvas stuff
	var canvas = $("#canvas")[0];
	var ctx = canvas.getContext("2d");
	var w = $("#canvas").width();
	var h = $("#canvas").height();
	var mx, my;
	
	var screen = 0;
	setInterval(function(){
	if (screen == 1) timer++;
	}, 100);
	
	var timer = 0;
	var day = 0;
	var tempday = 0;
	var temphour = 0;
	
	hiddennum = 102304506;
	var humans = [];
	var error = false;
	var pause = false;
	
	function human(){
		this.specialName = hiddennum;
		// DNA is the human's stats in the following order: 
		//			strand A:		Physical Stats: HEALTH, WEIGHT, COMBAT POWER
		//			strand B:		Traits: IMMUNITY, WISDOM, STRENGTH
		//																					
		this.sA = [20, 40, 10];
		this.sB = [10, 10, 10];
		this.food = 10;
		this.water = 10;
		this.index = 0;
		
		this.x = 45 + rand(70);
		this.y = 180 + rand(30);
		this.size = 16;
		this.speed = 0.5;
		this.obj = -1;
		this.target = -1;
		this.hp = this.sA[0];
		this.weight = this.sA[1];
		this.aggrolvl = 3 + rand(6);
		
		this.skinc = ("#f" + rand(9) + "f" + rand(9) + "8" + rand(9));
		this.canbreed = true;
		
		this.draw = function(){
			ctx.fillStyle = this.skinc;
			ctx.fillRect(this.x, this.y, this.size, this.size);
			ctx.fillStyle = 'black';
			ctx.font = '8pt Arial';
			ctx.fillText("Food: " + Math.round(this.food) + " Water: " + Math.round(this.water), this.x - 5, this.y - 30);
			ctx.fillText("HP: " + this.sA[0] + " WGT: " + this.sA[1] + " CP: " + this.sA[2], this.x - 5, this.y - 20);
			ctx.fillText("IMU: " + this.sB[0] + " WIS: " + this.sB[1] + " STR: " + this.sB[2], this.x - 5, this.y - 10);
			ctx.fillStyle = 'red';
			ctx.fillRect(this.x - 4, this.y - 4, 24, 2);
			ctx.fillStyle = 'lightgreen';
			ctx.fillRect(this.x - 4, this.y - 4, Math.round(24 * (this.hp / this.sA[0])), 2);
			ctx.fillStyle = 'black';
		}
		
		this.roam = function(){
			var rmove = rand(100);
				if(this.x + this.size < 1008 && this.y > 5 && this.y + this.size < 754){
					if(rmove <= 40 && rmove > 35){
						this.x += this.speed;
					} 
				} if(this.x > 5 && this.y > 5 && this.y + this.size < 754){
					if(rmove <= 35 && rmove > 30){
						this.x -= this.speed;
					} 
				} if(this.y + this.size < 754 && this.x > 5 && this.x + this.size < 1008){
					if(rmove <= 30 && rmove > 25){
						this.y += this.speed;
					}
				} if(this.y > 5 && this.x > 5 && this.x + this.size < 1008){
					if(rmove <= 25 && rmove > 20){
						this.y -= this.speed;
					}
				}
				if(rmove > 70) this.fobj();
		}
		
		this.task = function(){									// TASKING A.I
			if(this.food + this.water > this.sA[1]){
				var randomizer = rand(2);
				if(randomizer == 0){
					this.food -= 1;
				}else if(randomizer == 1){
					this.water -= 1;
				}
			}
			this.fobj = function(){
				if((this.food < 5 || this.water < 5) && this.aggrolvl > 7) this.obj = 6;			// Fight for food/water
				else if(this.food < 10 && this.food < this.water) this.obj = 1;			// Desperate Gather food
				else if(this.water < 10 && this.water < this.food) this.obj = 2;			// Desperate Gather water
				else if(this.food == this.water && this.food < 10 && this.water < 10) this.obj = 1;		// Prevent Objective Stalling
				else if(this.food == this.water && this.food >= 10 && this.water >= 10) this.obj = 4;		// Prevent Objective Stalling
				else if(this.food >= 19 && this.water >= 19) this.obj = 3;					// Breed
				else if(this.food >= 10 && this.food <= 22 && this.water >= 10 && this.water <= 22 && this.food < this.water) this.obj = 4;				// Bountyful Gather food
				else if(this.food >= 10 && this.food <= 22 && this.water >= 10 && this.water <= 22 && this.water < this.food) this.obj = 5;				// Bountyful Gather water
				
				else this.obj = 0;
			}
			if(this.obj == -1) this.fobj();
			if(this.obj == 0) this.roam();
			else if(this.obj == 1) this.gather("food", true);
			else if(this.obj == 2) this.gather("water", true);
			else if(this.obj == 3) this.mate();
			else if(this.obj == 4) this.gather("food", false);
			else if(this.obj == 5) this.gather("water", false);
			else if(this.obj == 6) this.fight();
			
		}
		
		this.gather = function(resource, isdesperate){
			if(resource == "food"){
			if(isdesperate) this.target = findclosest(this.x, this.y, sources, null);
			else this.target = findbestfood(this.x, this.y, sources);
			if(this.target == -1) this.target = findclosest(this.x, this.y, sources, null);
				if(typeof sources[this.target] === 'undefined') {
					this.target = findclosest(this.x, this.y, sources, null);
					console.log("Food source not found for: " + this.index);
					this.obj = 6;
				}
				else {
					if(this.x <= sources[this.target].x + 2){
						this.x += this.speed;
					}
					if(this.x > sources[this.target].x + 2){
						this.x -= this.speed;
					}
					if(this.y >= sources[this.target].y + 1){
						this.y -= this.speed;
					}
					if(this.y < sources[this.target].y + 1){
						this.y += this.speed;
					}
					if(this.x + this.size >= sources[this.target].x && this.x < sources[this.target].x + sources[this.target].w && this.y + this.size >= sources[this.target].y && this.y < sources[this.target].y + sources[this.target].h && sources[this.target].bloom == true){
						this.food += ((sources[this.target].value / 20) + (0.001 * this.sB[1]));
						sources[this.target].amount -= ((sources[this.target].value / 20) + (0.001 * this.sB[1]));
						if(sources[this.target].amount <= 0){
							sources[this.target].bloom = false;
						}
						if(isdesperate){
							this.fobj();
						}
						if(this.food >= this.weight / 2){
							this.fobj();
						}
					} else if (sources[this.target].bloom == false) {
						this.fobj();
					}
				}
				
			}
			if(resource == "water"){
				if(typeof wsources[0] === 'undefined') {
					console.log("Water source not found for: " + this.index);
					this.fobj();
				}
				else {
					if(this.x <= wsources[0].x + rand(100)){
						this.x += this.speed;
					}
					if(this.y >= wsources[0].y + 1){
						this.y -= this.speed;
					}
					if(this.y < wsources[0].y + 199){
						this.y += this.speed;
					}
					if(this.x + this.size >= wsources[0].x && this.x < wsources[0].x + wsources[0].w && this.y + this.size >= wsources[0].y && this.y < wsources[0].y + wsources[0].h + 1){
						this.water += (0.01 + (0.001 * this.sB[1]));
						if(!(isdesperate)){
							this.fobj();
						}
						if(this.water >= this.weight / 2){
							this.fobj();
						}
					}
				}
				
			}
		}		
		
		this.mate = function(){
			if(this.food > 19 && this.water > 19) this.canbreed = true;
			if(this.food < 20 || this.water < 20) this.fobj();
			if(this.x + this.size <= structures[0].x + Math.floor(structures[0].w / 2) - 10){
				this.x += this.speed;
			}
			if(this.x > structures[0].x + Math.floor(structures[0].w / 2)){
				this.x -= this.speed;
			}
			if(this.y >= structures[0].y + Math.floor(structures[0].h / 2) + humans[this.index].size){
				this.y -= this.speed;
			}
			if(this.y + this.size < structures[0].y + Math.floor(structures[0].h / 2) + humans[this.index].size){
				this.y += this.speed;
			}
			if(this.x + this.size > structures[0].x && this.x <= structures[0].x + (structures[0].w / 2) && this.y + this.size >= structures[0].y && this.y < structures[0].y + structures[0].h){
			var partner = findclosest(this.x, this.y, humans, this.index);
			if(partner == this.index) alternatefindclosest(this.x, this.y, humans, this.index);
			if(humans[this.index].canbreed == false) console.log(this.index + "CANT BREED");
					if(humans[partner].obj == 3 && this.canbreed == true && humans[partner].canbreed == true && this.x + this.size >= humans[partner].x && this.x <= humans[partner].x + humans[partner].size && this.y + this.size >= humans[partner].y && this.y <= humans[partner].y + humans[partner].size && this.index != partner){
						console.log("			Human " + (humans.length) + " has been born!");
						console.log("			Human " + humans.length + "'s parents are " + this.index + " and " + partner + "!");
						this.canbreed = false;
						humans[partner].canbreed = false;
						breed(this.index, partner);
						this.food = 5;
						humans[partner].food = 5;
						this.water = 5;
						humans[partner].water = 5;
						this.fobj();
						humans[partner].fobj();
					}
			}
		}
		
		this.fight = function(){
			if(this.aggrolvl > 7) var target = findclosest(this.x, this.y, humans, this.index);
			else if(this.aggrolvl <=7) this.fobj();
			if(humans[target].sA[2] < this.sA[2]){
				if(this.x < humans[target].x) this.x+= this.speed;
				else if(this.x > humans[target].x) this.x-= this.speed;
				if(this.y < humans[target].y) this.y+= this.speed;
				else if(this.y > humans[target].y) this.y-= this.speed;
				if(this.x + this.size > humans[target].x && this.x <= humans[target].x + humans[target].size && this.y + this.size > humans[target].y && this.y <= humans[target].y + humans[target].size){
					console.log("Human " + this.index + " is fighting " + target);
					humans[target].hp-= (this.sA[2] * 0.1);
					this.hp-=(humans[target].sA[2] * 0.1);
					this.food += 4;
					this.water += 4;
					this.fobj();
				}
			} else this.fobj();
		}
		
	}
	
	function findclosest(x, y, array, excluding){		// int, int, array, int
		var position = 0;
		for(var i = 1; i < array.length - 1; i++){
			if(array == sources && sources[i].bloom == true){
				if(Math.sqrt(Math.abs(((x - array[i].x) ^ 2) + ((y - array[i].y) ^ 2))) < Math.sqrt(Math.abs(((x - array[position].x) ^ 2) + ((y - array[position].y) ^ 2)))){
					position = i;
				}
			} else if(array == humans){
				if(Math.sqrt(Math.abs(((x - array[i].x) ^ 2) + ((y - array[i].y) ^ 2))) < Math.sqrt(Math.abs(((x - array[position].x) ^ 2) + ((y - array[position].y) ^ 2)))){
						if((i || position) != excluding) position = i;
				}
			}else if(array != (sources || humans)){
				if(Math.sqrt(Math.abs(((x - array[i].x) ^ 2) + ((y - array[i].y) ^ 2))) < Math.sqrt(Math.abs(((x - array[position].x) ^ 2) + ((y - array[position].y) ^ 2)))){
					position = i;
				}
			}
		}
		return position;
	}
	function alternatefindclosest(x, y, array, excluding){		// int, int, array, int
		var position = array.length - 1;
		for(var i = array.length - 1; i > 0; i--){
			if(array == humans){
				if(Math.sqrt(Math.abs(((x - array[i].x) ^ 2) + ((y - array[i].y) ^ 2))) < Math.sqrt(Math.abs(((x - array[position].x) ^ 2) + ((y - array[position].y) ^ 2)))){
						if((i || position) != excluding) position = i;
				}
			}
		}
		return position;
	}
	
	function findbestfood(x, y, array){
		var position = 0;
		for(var i = 0; i < array.length; i++){
			if(array[i].value > array[position].value && array[i].bloom == true){
				position = i;
			}
		}
		return position;
	}
	
	function breed(parent1, parent2){
		var p1 = parent1;
		var p2 = parent2;
		while(p1 == p2) p2 = rand(humans.length);
		
		humans.push(new human());
		humans[humans.length - 1].index = (humans.length - 1);
		humans[humans.length - 1].skinc = ("#f" + rand(9) + "f" + rand(9) + "8" + rand(9));
		humans[humans.length - 1].aggrolvl = 3 + rand(6);
		humans[humans.length - 1].food = 4 + rand(5);
		humans[humans.length - 1].water = 10 + rand(5);
		humans[humans.length - 1].sB[0] = Math.floor((humans[p1].sB[0] + humans[p2].sB[0]) / 2);
		humans[humans.length - 1].sB[1] = Math.floor((humans[p1].sB[1] + humans[p2].sB[1]) / 2);
		humans[humans.length - 1].sB[2] = Math.floor((humans[p1].sB[2] + humans[p2].sB[2]) / 2);
		humans[humans.length - 1].speed += (humans[humans.length - 1].sB[1] * 0.1 - 0.5);
		var mutator = rand(100);
		if(mutator <= 45 && mutator > 30){
			humans[humans.length - 1].sB[0] += 1;
			humans[humans.length - 1].sB[2] -= 1;
		}
		if(mutator <= 30 && mutator > 15){
			humans[humans.length - 1].sB[1] += 1;
			humans[humans.length - 1].sB[0] -= 1;
		}
		if(mutator <= 15 && mutator > 0){
			humans[humans.length - 1].sB[2] += 1;
			humans[humans.length - 1].sB[1] -= 1;
		}
		while((humans[humans.length - 1].sB[0] + humans[humans.length - 1].sB[1] + humans[humans.length - 1].sB[2]) != 30){
			var balancer = rand(3);
			if(balancer == 0){
				humans[humans.length - 1].sB[0] += 1;
			} else if(balancer == 1){
				humans[humans.length - 1].sB[1] += 1;
			} else if(balancer == 2){
				humans[humans.length - 1].sB[2] += 1;
			}
		}
		
		humans[humans.length - 1].sA[0] = Math.floor(100 * ((humans[p1].sA[0] + humans[p2].sA[0]) / 2 + (humans[humans.length - 1].sB[0] * 0.1 + (rand(4) - 2.5)))) / 100;
		humans[humans.length - 1].sA[1] = Math.floor(100 * ((humans[p1].sA[1] + humans[p2].sA[1]) / 2 + (humans[humans.length - 1].sB[1] * 0.1 + (rand(4) - 2.5)))) / 100;
		humans[humans.length - 1].sA[2] = Math.floor(100 * ((humans[p1].sA[2] + humans[p2].sA[2]) / 2 + (humans[humans.length - 1].sB[2] * 0.1 + (rand(4) - 2.5)))) / 100;
		if(humans[humans.length - 1].sA[0] < 1) humans[humans.length - 1].sA[0] = 1;
		if(humans[humans.length - 1].sA[1] < 1) humans[humans.length - 1].sA[1] = 1;
		if(humans[humans.length - 1].sA[2] < 1) humans[humans.length - 1].sA[2] = 1;
		
		humans[humans.length - 1].hp = humans[humans.length - 1].sA[0]
		humans[humans.length - 1].weight = humans[humans.length - 1].sA[1]
		
	}
	
	function disease(){
		if(day > tempday){
			tempday = day;
			var tmin = 0;
			for(var i = 0; i < humans.length; i++){
				if(humans[tmin].sB[0] > humans[i].sB[0]){
					tmin = i;
				}
			}
			humans.splice(tmin, 1);
			for(var i = 0; i < humans.length; i++){
				humans[i].index = i;
			}
		}
	}
	function drain(){
		if(timer / 300 > temphour){
			temphour++;
			for(var i = 0; i < humans.length; i++){
				humans[i].food--;
				humans[i].water--;
			}
		}
	}
	
	function cave(x, y, w, h, c, col){
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.capacity = c;
		this.colour = col;
		
		this.draw = function(){
			ctx.fillStyle = this.colour;
			ctx.fillRect(this.x, this.y, this.w, this.h);
			ctx.fillStyle = 'black';
			ctx.fillRect(this.x + Math.floor(this.w / 7), this.y + Math.floor(this.h / 2), this.w - Math.floor(this.w / 7) * 2, this.h - Math.floor(this.h / 2));
		}
	}
	
	function source(x, y, w, h, a, c, v, itimer){
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.colour = c;
		this.amount = a;
		this.bloom = true;
		this.internalclock = itimer * 67;
		this.value = v;
		
		this.draw = function(){
			if(this.colour != "blue"){
				ctx.fillStyle = "#bff442";
				ctx.fillRect(this.x - (this.w / 4), this.y + (this.h / 2), this.w + (this.w / 2), Math.floor(this.h * 3 / 4));
			}
			if(this.bloom){
				ctx.fillStyle = this.colour;
				ctx.fillRect(this.x, this.y, this.w, this.h);
			}
		}
		
		this.grow = function(){
			if(this.internalclock > 0 && this.bloom == false) this.internalclock --;
			if(this.bloom == false && this.internalclock == 0){
				this.amount = a;
				this.bloom = true;
				this.internalclock = itimer * 67;
				if(this.colour == "#cc0066"){
					console.log("Dew Plum has regrown at " + this.x + ", " + this.y + "!");
				} else if (this.colour == "#ac1026"){
					console.log("Violet Citron has regrown at " + this.x + ", " + this.y + "!");
				}
			}
		}
	}
	
	var sources = [];
	sources.push(new source(880, 250, 8, 8, 9999999, "#cc0066", 0.1, 30));
	sources.push(new source(470, 90, 8, 8, 30, "#cc0066", 1, 30));
	sources.push(new source(450, 240, 8, 8, 30, "#cc0066", 1, 30));
	sources.push(new source(370, 110, 8, 8, 30, "#cc0066", 1, 30));
	sources.push(new source(420, 80, 8, 8, 30, "#cc0066", 1, 30));
	sources.push(new source(380, 290, 8, 8, 30, "#cc0066", 1, 30));
	
	sources.push(new source(650, 340, 8, 8, 75, "#ac1026", 5, 50));
	sources.push(new source(850, 300, 8, 8, 75, "#ac1026", 5, 50));
	var wsources = [];
	wsources.push(new source(680, 4, 328, 200, 1000, "blue"));
	
	var structures = [];
	structures.push(new cave(30, 130, 100, 65, 8, "#232426"));
	
	var buttons = [];
	function button(x, y, screen, text){
		this.x = x;
		this.y = y;
		this.w = 150;
		this.h = 65;
		this.screen = screen;
		this.text = text;
		
		this.draw = function(){
			ctx.fillStyle = 'black';
			ctx.fillRect(this.x - 5, this.y - 5, this.w + 10, this.h + 10);
			ctx.fillStyle = 'grey';
			ctx.fillRect(this.x, this.y, this.w, this.h);
			ctx.fillStyle = 'white';
			ctx.font = 'bold 35pt Arial';
			ctx.fillText(this.text, this.x + 20, this.y + 50);
		}
	}
	
	buttons.push(new button(70, 180, 1, "Start"));
	buttons.push(new button(70, 280, 2, "Help"));
	function rand(n){return Math.floor(Math.random() * n)}
	
	/////////////////////////////////
	////////////////////////////////
	////////	GAME INIT
	///////	Runs this code right away, as soon as the page loads.
	//////	Use this code to get everything in order before your game starts 
	//////////////////////////////
	/////////////////////////////
	function init()
	{
		for(var i = 0; i < 2; i++){
			humans.push(new human());
		}
		humans[1].index = 1;
		humans[0].speed += 0.5;
		humans[1].speed += 0.5;
		for(var i = 0; i < 8; i++){
			breed(rand(humans.length), rand(humans.length));
		}
		/*								 TEST HUMANS
		humans.push(new human());
		humans[humans.length - 1].x = 200;
		humans[humans.length - 1].y = 700;
		humans[humans.length - 1].food = 3;
		humans[humans.length - 1].water = 3;
		humans[humans.length - 1].speed = 1;
		humans[humans.length - 1].agrrolvl = 10;
		humans[humans.length - 1].sA[2] = 15;
		humans[humans.length - 1].index = 10;
		humans.push(new human());
		humans[humans.length - 1].x = 240;
		humans[humans.length - 1].y = 700;
		humans[humans.length - 1].aggrolvl = 4;
		humans[humans.length - 1].sA[2] = 4;
		humans[humans.length - 1].index = 11;
		*/
		
	//////////
	///STATE VARIABLES
	
	//////////////////////
	///GAME ENGINE START
	//	This starts your game/program
	//	"paint is the piece of code that runs over and over again, so put all the stuff you want to draw in here
	//	"60" sets how fast things should go
	//	Once you choose a good speed for your program, you will never need to update this file ever again.

	if(typeof game_loop != "undefined") clearInterval(game_loop);
		game_loop = setInterval(paint, 16.7);
	}

	init();	
	


	
	
	
	///////////////////////////////////////////////////////
	//////////////////////////////////////////////////////
	////////	Main Game Engine
	////////////////////////////////////////////////////
	///////////////////////////////////////////////////
	function paint()
	{
		
		ctx.fillStyle = 'yellow';
		ctx.fillRect(0,0, w, h);
		
		if(screen == 0){
			ctx.fillStyle = 'blue';
			ctx.fillRect(20, 20, (w - 40), 100);
			ctx.fillStyle = 'black';
			ctx.font = 'bold 60pt Arial';
			ctx.fillText("Evolution", 60, 100);
			ctx.fillText("Simulator", 440, 100);
			ctx.fillStyle = 'white';
			ctx.font = 'bold 59pt Arial';
			ctx.fillText("Evolution", 60, 100);
			ctx.fillText("Simulator", 440, 100);
			for(var i = 0; i < buttons.length; i++){
			buttons[i].draw();
			}
		}	if(screen == 1){
				if(error != true){
					ctx.fillStyle = 'lightblue';
					ctx.fillRect(0,0, w, h);
					ctx.fillStyle = "black";
					ctx.fillRect(w - 304, 0, 304, h);
					ctx.fillStyle = "#1F2121";
					ctx.fillRect(w - 302, 2, 299, h - 4);
					
					ctx.fillStyle = "green";		// Simulation Area
					ctx.fillRect(4, 4, w - 312, h - 8);			// | TOP RIGHT: 4, 4 | WIDTH: 1004 | HEIGHT: 752 |
					ctx.fillStyle = 'green';
					ctx.fillRect(1020, 10, 285, 740);
					ctx.fillStyle = 'black';
					ctx.font = 'bold 20pt Arial';
					ctx.fillText("Species", 1035, 40);
					ctx.fillText("Information", 1140, 40);
					ctx.fillStyle = 'white';
					ctx.font = 'bold 19.5pt Arial';
					ctx.fillText("Species", 1034, 41);
					ctx.fillText("Information", 1139, 41);
					ctx.fillText(mx + ", " + my + " Humans: " + humans.length, 10, 40);
					ctx.fillStyle = 'yellow';
					ctx.fillRect(1026, 48, 272, 498);
					ctx.fillStyle = 'yellow';
					ctx.fillRect(1026, 556, 272, 186);
				}
				
				for(var i = 0; i < sources.length; i++){
					sources[i].draw();
					sources[i].grow();
				}
				for(var i = 0; i < wsources.length; i++){
					wsources[i].draw();
				}
				for(var i = 0; i < structures.length; i++){
					structures[i].draw();
				}
				for(var i = 0; i < humans.length; i++){
					humans[i].draw();
					humans[i].task();
					ctx.font = '12pt Arial';
					ctx.fillText(humans[i].index, 1030, (i * 17) + 100);
					ctx.fillText("IMU", 1050, 80);
					ctx.fillText(humans[i].sB[0], 1060, (i * 17) + 100);
					ctx.fillText("WIS", 1080, 80);
					ctx.fillText(humans[i].sB[1], 1085, (i * 17) + 100);
					ctx.fillText("STR", 1110, 80);
					ctx.fillText(humans[i].sB[2], 1110, (i * 17) + 100);
					ctx.fillText("HP", 1155, 80);
					ctx.fillText(humans[i].sA[0], 1150, (i * 17) + 100);
					ctx.fillText("WGT", 1205, 80);
					ctx.fillText(humans[i].sA[1], 1205, (i * 17) + 100);
					ctx.fillText("CP", 1255, 80);
					ctx.fillText(humans[i].sA[2], 1255, (i * 17) + 100);
					if(humans[i].food < 0 || humans[i].water < 0){
						humans.splice(i, 1);
						for(var i = 0; i < humans.length; i++){
							humans[i].index = i;
						}
					}
					if(this.hp <= 0){
						console.log("RIP, Human " + this.index + " has died.");
						humans.splice(this.index, i);
					}
					//if(humans.length > 26) humans.splice(rand(humans.length), 1);
				}
				day = Math.floor(timer / 900);
				ctx.fillStyle = 'white';
				ctx.font = 'bold 20pt Verdana';
				ctx.fillText("Day: " + day, 850, 40);
				
				disease();
				drain();
				
				
				
				
				
				
				
		}	if(screen == 2){
			ctx.fillStyle = 'yellow';
			ctx.fillRect(0,0, w, h);
		}
		ctx.fillStyle = 'green';
		

		
		
	}////////////////////////////////////////////////////////////////////////////////END PAINT/ GAME ENGINE
	

	
	
	////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////
	/////	MOUSE LISTENER 
	//////////////////////////////////////////////////////
	/////////////////////////////////////////////////////
	





	/////////////////
	// Mouse Click
	///////////////
	canvas.addEventListener('click', function (evt){
		if(screen == 0){
			for(var i = 0; i < buttons.length; i++){
				if(mx >= buttons[i].x && mx <= buttons[i].x + buttons[i].w && my >= buttons[i].y && my <= buttons[i].y + buttons[i].h){
						screen = buttons[i].screen;
				}
			}  
		}
		//if(screen == 1 && 
	}, false);

	
	

	canvas.addEventListener ('mouseout', function(){pause = true;}, false);
	canvas.addEventListener ('mouseover', function(){pause = false;}, false);

      	canvas.addEventListener('mousemove', function(evt) {
        	var mousePos = getMousePos(canvas, evt);

		mx = mousePos.x;
		my = mousePos.y;

      	}, false);


	function getMousePos(canvas, evt) 
	{
	        var rect = canvas.getBoundingClientRect();
        	return {
          		x: evt.clientX - rect.left,
          		y: evt.clientY - rect.top
        		};
      	}
      

	///////////////////////////////////
	//////////////////////////////////
	////////	KEY BOARD INPUT
	////////////////////////////////


	

	window.addEventListener('keydown', function(evt){
		var key = evt.keyCode;
		
	//p 80
	//r 82
	//1 49
	//2 50
	//3 51
		
	}, false);




})
