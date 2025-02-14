

var GameState = {
	player: null,
	actors: [],
	gameStage: null,

	addPlayer: function (data, socket) {
		if (!this.player) {
			var xPos = Math.floor(Math.random() * (3500)) + 500;

			var newPlayer = new Q.Player({
				playerId: data.playerId,
				name: data.name,
				name_dirty: true,		// Flag to indicate whether name need to be broadcast
				x: xPos,
				y: 10,
				socket: socket,
				hp_dirty: true,			// Flag to indicate whether hp has changed and need to be broadcast
				targetX: xPos,
				targetY: 0,
				color: data.color,
				color_dirty: true,		// Flag to indicate whether color has changed and need to be broadcast
			});
			this.player = newPlayer;
			this.gameStage.insert(this.player);
			
			this.gameStage.add('viewport').follow(this.player, { 
				x: true, 
				y: true
			});
			// Temp fix: Add yourself to list of actors
			this.actors.push({
				player: newPlayer,
				playerId: data.playerId
			});
		} else {
			console.log('Player already exists!');
		}
	},

	addActor: function (data) {
		var temp = new Q.Actor({ 
			playerId: data.playerId, 
			x: 0,
			y: 0,
			color: data.color
		});
		this.gameStage.insert(temp);
		this.actors.push({
			player: temp,
			playerId: data.playerId,
			color: data.color
		});
	},

	findActor: function (playerId) {
		return this.actors.filter(function (obj) {
			return obj.playerId == playerId;
		})[0];
	},

	removeActor: function (data) {
		var actor = this.findActor(data.playerId);
		if (actor) {
			this.gameStage.remove(actor.player);
		}
	},

	updateActors: function (data) {
		var actor = this.findActor(data.playerId);
		if (actor) {
			actor.player.updateState(data);
		} else {
			// New actor
			this.addActor(data);
		}
	},

	actorFire: function (data) {
		var actor = this.findActor(data.playerId);

		if (actor != undefined) {
			actor.player.shootWithData(data);
		} else {
			console.log ("Cannot find the actor that just shoot!");
		}
	},

	createPortal: function (data) {
		var actor = this.findActor(data.playerId).player;
		var portal = new Q.Portal({
			x: data.targetX,
			y: data.targetY,
			portalType: data.portalType,
			portalColor: data.portalColor,
			belongsToPlayer: actor
		});
		if (data.portalType === 'A') {
			if (actor.portalA) {
				actor.portalA.destroy();
			}
			actor.portalA = portal;
		} else {
			if (actor.portalB) {
				actor.portalB.destroy();
			}
			actor.portalB = portal;
		}
		this.gameStage.insert(portal);
	},

	addNinjaGhost: function (data) {
		var ninjaGhost = new Q.NinjaGhost({
			x: data.x,
			y: data.y
		});
		this.gameStage.insert(ninjaGhost);
	},

	addDamageIndicator: function (data) {
		var numberIndicator = new Q.NumberIndicator({
			x: data.x,
			y: data.y,
			damage: data.damage
		});
		this.gameStage.insert(numberIndicator);
	},

	updateLatency: function (latency, maxLatency) {
		// Update latency for all actors (player included)
		for (i in this.actors) {
			this.actors[i].player.p.latency = latency;
			this.actors[i].player.p.maxLatency = maxLatency;
		}
	}
};
