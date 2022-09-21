const objSize = [
    { x: 0, y: 0 },
    { x: 33.33, y: 0 },
    { x: 66.66, y: 0 },
    { x: 100, y: 0 },
    { x: 0, y: 33.33 },
    { x: 33.33, y: 33.33 },
    { x: 66.66, y: 33.33 },
    { x: 100, y: 33.33 },
    { x: 0, y: 66.66 },
    { x: 33.33, y: 66.66 },
    { x: 66.66, y: 66.66 },
    { x: 100, y: 66.66 },
    { x: 0, y: 100 },
    { x: 33.33, y: 100 },
    { x: 66.66, y: 100 },
    { x: 100, y: 100 }
]

var optionsTime1 = {
    minute: "2-digit",
    second: "2-digit",
};

var indexArr = [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1];

const baseTime = 3;

function rndIndex(min, max, count) {
    if (count > max - min + 1) throw "impossible";
    let set = new Set();
    while (set.size < count) {
        let num = (Math.random() * (max - min + 1) + min) | 0;
        set.add(num);
    }
    return [...set];
}

let startTime = 0;
let remainTime = 0;
let lastTime = 0;
let lastTick = 0;
let timer;
let startDisable = false;

function setStartDisabled(value) {
    startDisable = value;
    $('#start').prop("disabled", value);
    $('#start').prop("enabled", !value);
    $('#check').prop("disabled", !value);
    $('#check').prop("enabled", value);
    if (!value) {
        clearInterval(timer);
        remainTime = 0;
        startTime = 0;
        lastTime = 0;
        lastTick = 0;
        $('.time-min').html('00:00');
    }
}

function myTimer() {
    let currTime = new Date().getTime();
    remainTime += Math.abs(currTime - lastTick);
    lastTick = currTime;
    let showTime = lastTime - remainTime;
    if (showTime >= 0) {
        let mm = Math.trunc((showTime) / (60 * 1000)); // Получаем минуты
        let ss = Math.trunc((showTime - mm * 60 * 1000) / 1000); // Получаем секунды
        let msec = (showTime - mm * 60 * 1000 - ss * 1000);
        loopTimeMin = new Date(0, 0, 0, 0, mm, ss, msec);
        $('.time-min').html(loopTimeMin.toLocaleTimeString([], optionsTime1));
    }
    else {
        startDisable = false;
        setStartDisabled(false);
        clearInterval(timer);
        remainTime = 0;
        startTime = 0;
        lastTime = 0;
        lastTick = 0;
        $('.time-min').html('00:00');
    }
}

function startGame() {
    if (startDisable) {
        return;
    }

    startDisable = true;
    setStartDisabled(true);

    if (remainTime == 0) {
        startTime = 0;
        lastTime = baseTime * 60 * 1000;
        remainTime = 0;
    }
    else {
        startTime = remainTime;
    }

    lastTick = new Date().getTime();

    timer = setInterval(myTimer, 100);

}

$(document).ready(function () {

    function checkResult() {
        let result = false;
        let index = '';
        let clName = '';
        const testStr = /box/;
        $('.puzzle-box .box-dest div').each(function (idx, el) {

            // let num = $(el).text();
            let num = Number.parseInt($(el).text());

            num_active = $('.box-dest').index($(el).parent());
            indexArr[num_active] = num;
        });

        result = false;
        // console.log(indexArr);
        for (let i = 0; i < indexArr.length - 1; i++) {
            result = (indexArr[i] + 1) == indexArr[i + 1];
            // console.log(indexArr[i] + 1, indexArr[i + 1]);
            if (!result) {
                break;
            }
        }
        // console.log(result);

        return result;

    }

    function showCheck() {
        $('.modal-container').css({
            backgroundColor: '#000000c7',
            opacity: 0.5,
            zIndex: 3
        });

        $('.modal-box').addClass("show");
        $('.info').text("You still have time, you sure ?");
    }


    function newGame() {
        setStartDisabled(false);

        let arrIndex = rndIndex(1, 16, 16);
        let i;
        $('.puzzle-box .box').each(function (idx, el) {
            $('.puzzle-box .box').remove();
        });

        for (i = 1; i <= 16; i++) {
            let div = document.createElement('div');
            div.className = 'box';
            $('#src').append(div);
        }

        $('.puzzle-box .box-dest div').each(function (idx, el) {
            $('.puzzle-box .box-dest div .box').remove();
        });

        arrIndex.forEach(function (elem, index) {
            $(`.puzzle-box .box:nth-of-type(${index + 1})`).css('background-position', `${objSize[elem - 1].x}% ${objSize[elem - 1].y}%`);
            $(`.puzzle-box .box:nth-of-type(${index + 1})`).text(`${elem - 1}`);
        });

        $('#src .box').draggable({
            revert: true,
            drag: function (event, ui) {
                if (!startDisable) {
                    startGame();
                }
            }
        });

        $('#src').droppable({
            // hoverClass: 'hover',
            tolerance: 'intersect',
            drop: function (event, ui) {
                let count = $(this).children().length;
                console.log(count);
                if (count < 16) {
                    $(ui.draggable).detach().css({ top: 0, left: 0 }).appendTo(this);
                    checkResult();
                }
            }
        })

        $('#dest .box-dest').draggable({
            revert: true
        });


        $('#dest .box-dest').droppable({
            hoverClass: 'hover',
            tolerance: 'intersect',
            drop: function (event, ui) {
                let count = $(this).children().length;
                console.log(count);
                if (count == 0) {
                    $(ui.draggable).detach().css({ top: 0, left: 0 }).appendTo(this);
                    checkResult();
                }
            }
        })

    }

    function checkAdd() {
        let isOk = checkResult();
        if (isOk) {
            $('.info').text("Woohoo, well done, you did it!");
            $('#check-add').addClass("hide");
            $('.time-min').addClass("hide");
            startDisable = false;
            setStartDisabled(false);
            clearInterval(timer);
            $('#start').prop("disabled", true);
            $('#start').prop("enabled", false);
            remainTime = 0;
            startTime = 0;
            lastTime = 0;
            lastTick = 0;
            $('.time-min').html('00:00');
        }
        else {
            $('.info').text("It's a pity, but you lost");
            $('#check-add').addClass("hide");
            $('.time-min').addClass("hide");
        }
    }



    setStartDisabled(false);
    newGame();

    $('#new').on('click', newGame);

    $('#start').on('click', startGame);

    $('#check').on('click', showCheck);

    $('#check-add').on('click', checkAdd);

    $('#close').on('click', function () {
        $('#check-add').removeClass("hide");
        $('.time-min').removeClass("hide");

        $('.modal-box').removeClass("show");
        $('.modal-container').css({
            backgroundColor: '#fff',
            zIndex: -1
        });
    });


})