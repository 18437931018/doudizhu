const str = ['黑桃', '红桃', '梅花', '方片', '小王', '大王'];
const plays = ['play1', 'play2', 'play3'];
class Card {
    constructor(num, type) {
        this.num = num;
        this.type = type;
        this.com = num;

        if (num === 1)
            this.com = 14;
        else if (num === 2)
            this.com = 15;
        else if (num === 14 && type === 5)
            this.com = 16;
        this.cardType = str[type];
    }
}
class Play {
    constructor(name, cardArr) {
        this.name = name;
        this.cardArr = cardArr;
        this.isDizhu = false;
        this.playing = false;
        this.sortCard();
    }
    sortCard() {
        this.cardArr.sort((a, b) => a.num - b.num);
    }
}
class Manager {
    constructor() {
        this.allCards = [];
        this.plays = [];
        this.init();
        this.playing = 0;
        this.playingArr = [];
        this.groundArr = [];
    };
    init() {
        for (let i = 1; i <= 13; i++) {
            for (let j = 0; j < 4; j++) {
                this.allCards.push(new Card(i, j))
            }
        }
        this.allCards.push(new Card(14, 4));
        this.allCards.push(new Card(14, 5));
        // console.log(this.allCards)
    };
    play() {
        this.plays = [];
        this.playingArr = [];
        this.groundArr = [];
        //洗牌
        this.allCards.sort(o => 0.5 - Math.random());
        this.plays.push(new Play('play1', this.allCards.slice(0, 17)));
        this.plays.push(new Play('play2', this.allCards.slice(17, 34)));
        this.plays.push(new Play('play3', this.allCards.slice(34, 51)));
        // this.plays[Math.floor(3 * Math.random())].name = '我';
        this.plays[0].name = '我';
        let dizhuIndex = Math.floor(3 * Math.random())
        let dizhu = this.plays[dizhuIndex];
        dizhu.cardArr = dizhu.cardArr.concat(this.allCards.slice(51));
        this.timeId && clearTimeout(this.timeId);
        this.timeId = setTimeout(() => {
            dizhu.isDizhu = true;
            dizhu.playing = true;
            this.playing = dizhuIndex;
            dizhu.sortCard(), this.createUi()
        }, 1000)
        this.createUi();
    };
    createUi() {
        plays.forEach((v, k) => {
            this.creatPlay(k)
        })
    }
    creatPlay(k) {
        let v = plays[k];
        let div = document.getElementById(v)
        div.innerHTML = '';
        let play = this.plays[k]
        div.innerText = play.name;
        play.cardArr.forEach(o => [
            div.appendChild(this.creatCard(o.num, str[o.type]))
        ])
        play.playing && creatPlayBtn(this);

        function creatPlayBtn(_this) {
            let btnDiv = document.createElement('div');
            btnDiv.setAttribute('id', 'playBtnDiv');
            let playBtn = document.createElement('button');
            playBtn.setAttribute('id', 'playBtn');
            playBtn.setAttribute('class', 'playBtn');
            playBtn.innerText = '出牌';
            playBtn.onclick = () => {
                _this.playCard()
            };
            let skipBtn = document.createElement('button');
            skipBtn.setAttribute('id', 'skipBtn');
            skipBtn.setAttribute('class', 'playBtn');
            skipBtn.innerText = '不出';
            skipBtn.onclick = () => {
                _this.next()
            };
            btnDiv.appendChild(playBtn);
            btnDiv.appendChild(skipBtn);
            div.appendChild(btnDiv)
        }
        let cards = document.getElementsByClassName('card');
        for (let i in cards) {
            if (typeof cards[i] === 'object')
                cards[i].onclick = (e) => {
                    if (e.target.parentNode.id !== plays[this.playing])
                        return alert('非本玩家')
                    e.target.style.marginTop = e.target.style.marginTop === '20px' ? '50px' : '20px';
                    if (e.target.style.marginTop === '20px') {
                        e.target.classList.add('selected')
                    } else {
                        e.target.classList.remove('selected')
                    }
                }
        }
    };

    creatCard(num, type) {
        let cardDiv = document.createElement('div');
        // cardDiv.setAttribute('id', o.num);
        cardDiv.setAttribute('class', "card");
        // cardDiv.classList.add(v);
        // cardDiv.setAttribute('class', v);
        cardDiv.setAttribute('value', num);
        cardDiv.innerText = `${num}\n${type}`;
        return cardDiv
    }

    playCard() {
        let cards = document.getElementsByClassName(`selected`);
        let type = [];
        let playingArr = [];
        this.playingArr = [];
        for (let i in cards) {
            // console.log(cards[i].innerText)
            if (cards[i].innerText) {
                playingArr.push(+cards[i].innerText.replace(/[^0-9]/ig, ""))
                type.push(cards[i].innerText.replace(/[0-9]/ig, ""))
            }
        }

        playingArr.forEach((v, k) => {
            this.playingArr = this.playingArr.concat(this.plays[this.playing].cardArr.filter(o => o.num === v && type[k].indexOf(o.cardType) > -1))
            //[].concat(this.playingArr, this.plays[this.playing].cardArr.filter(o => o.num === v && type[k].indexOf(o.cardType) > -1))
        });


        if (!judge.cardsTypeJudge(this.playingArr))
            return alert('非法')
        if (this.playing === this.prePlayer || this.groundArr.length === 0 || judge.canPlay(this.playingArr, this.groundArr)) {
            document.getElementById('ground').innerHTML = '';
            playingArr.forEach((v, k) => {
                document.getElementById('ground').appendChild(this.creatCard(v, type[k]));
                this.plays[this.playing].cardArr = this.plays[this.playing].cardArr.filter(o => o.num !== v && o.cardType !== type[k])
            });
            this.groundArr = this.playingArr;
            this.prePlayer = this.playing;
            this.next();
        }
    }
    next() {
        this.plays[this.playing].playing = false;
        this.creatPlay(this.playing)
        this.playing++;
        if (this.playing == 3)
            this.playing = 0;
        this.plays[this.playing].playing = true;
        this.creatPlay(this.playing);
    }
}

class Judge {
    constructor() {}
    canPlay(cards, curCards) {
        var self = this
        var type1 = self.cardsTypeJudge(cards)
        console.log(`点击选择的纸牌：${type1}`)
        var type2 = self.cardsTypeJudge(curCards)
        console.log(`桌面上已有牌型：${type2}`)
        if (!type1) {
            alert('非法出牌')
            return 0;
        }
        if (cards.length > 0 && curCards.length > 0) {
            if (type1 != type2) { //牌型不同
                if (!(type1 == '火箭' || (type1 == '炸弹' && type2 != '火箭'))) {
                    // console.log(`牌型不同`)
                    alert('牌型不同')
                    return 0
                }
            } else { //牌型相同
                if (type1 == '单牌' || type1 == '对牌' || type1 == '三张牌' || type1 == '炸弹') {
                    if (cards[0].com <= curCards[0].com) {
                        // console.log(`分值小于等于牌桌上的牌`)
                        alert('分值不大于牌桌上的牌')
                        return 0
                    }
                }
                if (cards.length != curCards.length) {
                    //console.log(`总张数不同`)
                    alert('总张数不同')
                    return 0
                } else {
                    // cards = _.orderBy(cards, ['value'], ['desc'])
                    // curCards = _.orderBy(curCards, ['value'], ['desc'])

                    cards.sort((a, b) => a.com - b.com);
                    curCards.sort((a, b) => a.com - b.com);

                    if (type1 == '单顺' || type1 == '双顺' || type1 == '三顺') {
                        if (cards[0].com <= curCards[0].com) {
                            // console.log(`分值小于等于牌桌上的牌`)
                            alert('分值不大于牌桌上的牌')
                            return 0
                        }
                    } else if (type1 == '三带一张牌' || type1 == '三带一对牌') {
                        var mark = {}
                        var x = 0
                        var y = 0
                        for (var i = 0; i < cards.length; i++) {
                            if (!mark[cards[i].com])
                                mark[cards[i].com] = 1
                            else
                                mark[cards[i].com]++
                            if (mark[cards[i].com] == 3)
                                x = cards[i].com
                        }
                        for (var i = 0; i < curCards.length; i++) {
                            if (!mark[curCards[i].com])
                                mark[curCards[i].com] = 1
                            else
                                mark[curCards[i].com]++
                            if (mark[curCards[i].com] == 3)
                                y = curCards[i].com
                        }
                        if (x <= y) {
                            // console.log(`分值小于等于牌桌上的牌`)
                            alert('分值不大于牌桌上的牌')
                            return 0
                        }
                    } else if (type1 == '四带二') {
                        var mark = {}
                        var x = 0
                        var y = 0
                        for (var i = 0; i < cards.length; i++) {
                            if (!mark[cards[i].com])
                                mark[cards[i].com] = 1
                            else
                                mark[cards[i].com]++
                            if (mark[cards[i].com] == 4)
                                x = cards[i].com
                        }
                        for (var i = 0; i < curCards.length; i++) {
                            if (!mark[curCards[i].com])
                                mark[curCards[i].com] = 1
                            else
                                mark[curCards[i].com]++
                            if (mark[curCards[i].com] == 4)
                                y = curCards[i].com
                        }
                        if (x <= y) {
                            // console.log(`分值小于等于牌桌上的牌`)
                            alert('分值不大于牌桌上的牌')
                            return 0
                        }
                    } else if (type1 == '飞机带翅膀') {
                        var mark = {}
                        var max1 = 0
                        var max2 = 0
                        for (var i = 0; i < cards.length; i++) {
                            if (!mark[cards[i].com])
                                mark[cards[i].com] = 1
                            else
                                mark[cards[i].com]++
                            if (mark[cards[i].com] == 3) {
                                if (cards[i].com > max1)
                                    max1 = cards[i].com
                            }
                        }
                        for (var i = 0; i < curCards.length; i++) {
                            if (!mark[curCards[i].com])
                                mark[curCards[i].com] = 1
                            else
                                mark[curCards[i].com]++
                            if (mark[curCards[i].com] == 3) {
                                if (curCards[i].com > max2)
                                    max2 = curCards[i].com
                            }
                        }
                        if (max1 <= max2) {
                            // console.log(`分值小于等于牌桌上的牌`)
                            alert('分值不大于牌桌上的牌')
                            return 0
                        }
                    }
                }
            }
        }
        return 1
    }

    cardsTypeJudge(cards) {
        if (cards.length == 1)
            return '单牌'
        if (cards.length == 2 && cards[0].num === 14 && cards[1].num === 14)
            return '火箭'

        // cards = _.orderBy(cards, ['value'], ['desc'])
        cards.sort((a, b) => a.num - b.num);
        let arr = []
        let cnt = 1
        let flag = true //判断顺牌
        for (var i = 0; i < cards.length; i++) {
            if (i < cards.length - 1 && cards[i].num == cards[i + 1].num)
                cnt++
            else {
                if ((arr.length > 0 && cnt != arr[arr.length - 1]) ||
                    cards[i].num >= 13 || cards.length < 5)
                    flag = false
                arr.push(cnt)
                cnt = 1
            }
        }

        if (flag) {
            if (arr[0] == 1 && arr.length >= 5) {
                let judge = true
                for (var i = 0; i < cards.length; i++) {
                    if (i < cards.length - 1) {
                        if (cards[i].num - cards[i + 1].num != 1) {
                            judge = false
                        }
                    }
                }
                if (judge)
                    return '单顺'
            } else if (arr[0] == 2 && arr.length >= 3) {
                let judge = true
                for (var i = 0; i < cards.length; i = i + 2) {
                    if (i < cards.length - 2) {
                        if (cards[i].num - cards[i + 2].num != 1) {
                            judge = false
                        }
                    }
                }
                if (judge)
                    return '双顺'
            } else if (arr[0] == 3 && arr.length >= 2) {
                let judge = true
                for (var i = 0; i < cards.length; i = i + 3) {
                    if (i < cards.length - 3) {
                        if (cards[i].num - cards[i + 3].num != 1) {
                            judge = false
                        }
                    }
                }
                if (judge)
                    return '三顺'
            }
        } else {
            // arr = _.sortBy(arr)
            arr.sort();
            if (arr.length == 1) {
                if (arr[0] == 2)
                    return '对牌'
                else if (arr[0] == 3)
                    return '三张牌'
                else if (arr[0] == 4)
                    return '炸弹'
            } else if (arr.length == 2) {
                if (arr[0] == 1 && arr[1] == 3)
                    return '三带一张牌'
                else if (arr[0] == 2 && arr[1] == 3)
                    return '三带一对牌'
            } else if (arr.length == 3) {
                if ((arr[0] == 1 && arr[1] == 1 && arr[2] == 4) ||
                    (arr[0] == 2 && arr[1] == 2 && arr[2] == 4))
                    return '四带二'
            } else if (arr.length >= 4) {
                if (arr.length % 2 == 0) {
                    let flag = true
                    for (var i = 0; i < arr.length / 2; i++) {
                        if ((i < arr.length / 2 - 1 && arr[i] != arr[i + 1]) ||
                            (arr[i] != 1 && arr[i] != 2))
                            flag = false
                    }
                    for (var i = arr.length / 2; i < arr.length; i++) {
                        if (arr[i] != 3)
                            flag = false
                    }
                    if (flag)
                        return '飞机带翅膀'
                }
            }
        }
        return null
    }

}

const manager = new Manager();
const judge = new Judge();
window.onload = () => {
    document.getElementById('btn').addEventListener('click', () => {
        manager.play();
    })
}