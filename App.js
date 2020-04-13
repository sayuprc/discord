const Discord = require('discord.js');
const client = new Discord.Client();
const token = 'Njk4NjA2MjY1Nzc3MTI3NDk0.XpIR4w.AK0aQDvbaiTLb7oACjvD12Y9X14';
// データ配列
let vote_lists = [];
// リアクションの絵文字
let reaction_numbers = [
	"\u0030\u20E3",
	"\u0031\u20E3",
	"\u0032\u20E3",
	"\u0033\u20E3",
	"\u0034\u20E3",
	"\u0035\u20E3",
	"\u0036\u20E3",
	"\u0037\u20E3",
	"\u0038\u20E3",
	"\u0039\u20E3"
];


client.on('ready', () => {
	console.log('ready...');
});

client.on('message', message => {
	if(message.author.bot) return;

	if(message.content.match(/\.vote/)) {
		let args = message.content.substr(6);
		let tmp = args.split(/\s+/);
		let question = tmp[0];

		let select;
		let i = 0;
		let j = 1;
		let len = tmp.length;

		if(11 <= len) {
			message.channel.send("選択肢は9個までです。");
			return;
		}

		while(i < len) {
			if(i < 1) {
				i++;
				continue;
			}
			select = j + '. ' + tmp[i];
			i++;
			j++;

			question += "\n" + select;
		}

		let k = 1;
		message.channel.send(question).then(async(val) => {
			while(k < j) {
				await val.react(reaction_numbers[k]);
				k++;
			}
		});

		return;
	}
});

// ボットに対するリアクションをしたとき
client.on('messageReactionAdd', async(reaction, user) => {
	if(user.username === 'simple_vote') return;
	if(reaction.message.author.username !== 'simple_vote') return;

	let message = reaction.message;
	let exists_flg = false;

	// オブジェクト内に既にあるか あればtrue
	if(!isEmpty(vote_lists)) {
		for(let [i, list] of vote_lists.entries()) {
			// user.idとmessage.idの組み合わせが既にある場合
			if(list.user_id == user.id && list.message_id == message.id) {
				vote_lists.splice(i, 1);
				const userReactions = message.reactions.cache.filter(reaction => reaction.users.cache.has(user.id));
				for(const last_reaction of userReactions.values()) {
					if(reaction.emoji.name == last_reaction.emoji.name) continue;
					last_reaction.users.remove(user.id);
				}
			}
		}
	}

	let obj = {
		user_id: user.id,
		message_id: message.id,
		reaction: reaction.emoji.name,
	};
	vote_lists[vote_lists.length] = obj;

	return;
});

// ボットに対するリアクションを取り消したとき
client.on('messageReactionRemove', async(reaction, user) => {
	if(user.username === 'simple_vote') return;
	if(reaction.message.author.username !== 'simple_vote') return;

	let message = reaction.message;

	for(let [index, list] of vote_lists.entries()) {
		if(list.user_id == user.id && list.message_id == message.id && list.reaction == reaction.emoji) {
			vote_lists.splice(index, 1);
		}
	}

	return;
});

// ボットのメッセージを削除したとき
client.on('messageDelete', message => {
	if(message.author.username !== 'simple_vote') return;

	if(isEmpty(vote_lists)) return;

	let index = [];

	for(let [i, list] of vote_lists.entries()) {
		if(list.message_id == message.id) {
			// spliceは配列の順序が変わってしまうのでdeleteでundefineにする
			delete vote_lists[i];
		}
	}

	// filterでundefineを詰める
	vote_lists = vote_lists.filter(v => v);

	return;
});

// 値が空か判定 空はtrue
function isEmpty(val) {
	if(!val) {
		if(val !== 0 && val !== false) {
			return true;
		}
	}else if(typeof val == "object") {
		return Object.keys(val).length === 0;
	}

	return false;
}

client.login(token);
