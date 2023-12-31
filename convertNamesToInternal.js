function convertNamesToInternal(character) {
	switch (character.toLowerCase()) {
		case 'donkey_kong':
			return 'donkey';
		case 'dark_samus':
			return 'samusd';
		case 'captain_falcon':
			return 'captain';
		case 'jigglypuff':
			return 'purin';
		case 'peach':
			return 'peach';
		case 'bowser':
			return 'koopa';
		case 'ice_climbers':
			return 'ice_climber';
		case 'dr._mario':
			return 'mariod';
		case 'young_link':
			return 'younglink';
		case 'ganondorf':
			return 'ganon';
		case 'mewtwo':
			return 'mewtwo';
		case 'mr.game___watch':
			return 'gamewatch';
		case 'meta_knight':
			return 'metaknight';
		case 'dark_pit':
			return 'pitb';
		case 'zero_suit_samus':
			return 'szerosuit';
		case 'pokemon_trainer':
			return 'ptrainer';
		case 'diddy_kong':
			return 'diddy';
		case 'king_dedede':
			return 'dedede';
		case 'olimar':
			return 'pikmin';
		case 'r.o.b.':
			return 'robot';
		case 'toon_link':
			return 'toonlink';
		case 'villager':
			return 'murabito';
		case 'mega_man':
			return 'rockman';
		case 'wii_fit_trainer':
			return 'wiifit';
		case 'rosalina___luma':
			return 'rosetta';
		case 'little_mac':
			return 'littlemac';
		case 'greninja':
			return 'gekkouga';
		case 'mii brawler':
			return 'miifighter';
		case 'mii_swordfighter':
			return 'miiswordsman';
		case 'mii_gunner':
			return 'miigunner';
		case 'pac-man':
			return 'pacman';
		case 'robin':
			return 'reflet';
		case 'bowser_jr.':
			return 'koopajr';
		case 'duck_hunt':
			return 'duckhunt';
		case 'corrin':
			return 'kamui';
		case 'king_k._rool':
			return 'krool';
		case 'isabelle':
			return 'shizue';
		case 'incineroar':
			return 'gaogaen';
		case 'piranha_plant':
			return 'packun';
		case 'joker':
			return 'jack';
		case 'hero':
			return 'brave';
		case 'banjo___kazooie':
			return 'buddy';
		case 'terry':
			return 'dolly';
		case 'byleth':
			return 'master';
		case 'min_min':
			return 'tantan';
		case 'steve':
			return 'pickel';
		case 'sephiroth':
			return 'edge';
		case 'pyra___mythra':
			return 'pyramythra';
		case 'mythra':
			return 'elight';
		case 'kazuya':
			return 'demon';
		case 'sora':
			return 'trail';
		default:
			return character.toLowerCase();
	}
}
