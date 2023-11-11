function convertNamesToInternal(character) {
	switch (character.toLowerCase()) {
		case 'donkey kong':
			return 'donkey';
		case 'dark samus':
			return 'samusd';
		case 'captain falcon':
			return 'captain';
		case 'jigglypuff':
			return 'purin';
		case 'peach':
			return 'peach';
		case 'bowser':
			return 'koopa';
		case 'ice climbers':
			return 'ice_climber';
		case 'dr. mario':
			return 'mariod';
		case 'young link':
			return 'younglink';
		case 'ganondorf':
			return 'ganon';
		case 'mewtwo':
			return 'mewtwo';
		case 'mr.game & watch':
			return 'gamewatch';
		case 'meta knight':
			return 'metaknight';
		case 'dark pit':
			return 'pitb';
		case 'zero suit samus':
			return 'szerosuit';
		case 'pokemon trainer':
			return 'ptrainer';
		case 'diddy kong':
			return 'diddy';
		case 'king dedede':
			return 'dedede';
		case 'olimar':
			return 'pikmin';
		case 'r.o.b.':
			return 'robot';
		case 'toon link':
			return 'toonlink';
		case 'villager':
			return 'murabito';
		case 'mega man':
			return 'rockman';
		case 'wii fit trainer':
			return 'wiifit';
		case 'rosalina & luma':
			return 'rosetta';
		case 'little mac':
			return 'littlemac';
		case 'greninja':
			return 'gekkouga';
		case 'mii brawler':
			return 'miifighter';
		case 'mii swordfighter':
			return 'miiswordsman';
		case 'mii gunner':
			return 'miigunner';
		case 'pac-man':
			return 'pacman';
		case 'robin':
			return 'reflet';
		case 'bowser jr.':
			return 'koopajr';
		case 'duck hunt':
			return 'duckhunt';
		case 'corrin':
			return 'kamui';
		case 'king k. rool':
			return 'krool';
		case 'isabelle':
			return 'shizue';
		case 'incineroar':
			return 'gaogaen';
		case 'piranha plant':
			return 'packun';
		case 'joker':
			return 'jack';
		case 'hero':
			return 'brave';
		case 'banjo & kazooie':
			return 'buddy';
		case 'terry':
			return 'dolly';
		case 'byleth':
			return 'master';
		case 'min min':
			return 'tantan';
		case 'steve':
			return 'pickel';
		case 'sephiroth':
			return 'edge';
		case 'pyra & mythra':
			return 'eflame';
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
