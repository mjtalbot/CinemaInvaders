define(['cinema_invaders'],function(){
    var canvas;
    var context;
    var width;
    var height;
    var popcorn = [];
    var tiny_popcorn = [];
    var popcorn_images =[];
    var popcorn_image;
    var ready = false;
    var popcorn_count;
    var popcorn_per_second = 3;
    var delete_popcorn = [];
    var man_eating_images = [];
    var man_ready = false;
    var max_lines;
    var man;
    var man_image;
    var ci =  {
        initialize: function(canvas_id, pop_count) {
            canvas = document.getElementById(canvas_id);
            context = canvas.getContext("2d");
            width = canvas.width;
            height = canvas.height;
            popcorn_image = new Image();
            popcorn_image.src = "../img/popcorn.png";
            popcorn_image.onload = function(){
                ready = true;
                max_lines = Math.floor((height-100-popcorn_image.height)/popcorn_image.height)-1;
            }
            
            man = {
                x : 0,
                y : height-113, 
                eating : false, 
                man_eating_index : 0, 
                score: 0
            };
            man_image = new Image();
            man_image.src = "../img/man.png";
            man_image.onload = function(){
                man_ready = true;
            }
            var tmp;
            for (var i =1; i < 5; i++){
                tmp = new Image();
                tmp.src = "../img/man_eat_"+i+".png";
                man_eating_images.push(tmp);
            }
            for (var i =1; i < 7; i++){
                tmp = new Image();
                tmp.src = "../img/pop"+i+".png";
                popcorn_images.push(tmp);
            }
            popcorn_count = pop_count;
            canvas.onclick = ci.onclick;
            canvas.onmousemove = ci.mousemove;
        },
        mousemove: function(event) {
            man.x = event.offsetX - man_image.width/2;
        },
        onclick: function(event) {
            for (var i=0; i < popcorn.length ; i++) {
                if (popcorn[i].x<event.offsetX && event.offsetX< popcorn[i].x + popcorn_image.width && 
                    popcorn[i].y< event.offsetY && event.offsetY< popcorn[i].y+ popcorn_image.height) {
                    ci.explode_popcorn(i,false);
                    break;
                }
            }
        },
        draw_background: function() {
            context.beginPath();
            context.moveTo(0,height-100);
            context.lineTo(width,height-100);
            context.stroke();
        }, 
        add_popcorn: function() {
            popcorn.push({
                x:-popcorn_image.width,
                y:popcorn_image.height, 
                speedx: 6,
                speedy: 0,
                line : 0
            })
            popcorn_count = popcorn_count - 1;
            if (popcorn_count > 0) {
                setTimeout(ci.add_popcorn,1000/popcorn_per_second);
            }
        }, 
        draw_popcorn: function() {
            for (var i=0; i < popcorn.length ; i++) {
                context.drawImage(popcorn_image, popcorn[i].x, popcorn[i].y);
            }
            for (var j=0; j < tiny_popcorn.length; j++) {
                context.drawImage(tiny_popcorn[j].img, tiny_popcorn[j].x, tiny_popcorn[j].y);
            }
        },
        draw_man: function() {
            if (man.eating) {
                context.drawImage(man_eating_images[man.man_eating_index], man.x, man.y);
                man.man_eating_index = (man.man_eating_index + 1)% man_eating_images.length
            }
            else {  
                context.drawImage(man_image, man.x, man.y);
            }
        },
        explode_popcorn: function(index, charged) {
            var tmp = popcorn.splice(index,1)[0]
            var popcount = Math.floor(Math.random()*40)+30;
            var popcorn_index;
            for (var i =0; i < popcount; i++) {
                popcorn_index = Math.floor(Math.random()*popcorn_images.length)
                bonus = (charged)?8:1;
                tiny_popcorn.push({
                    x: tmp.x+popcorn_image.width/2 + (Math.random()*2-1) * popcorn_image.width/2,
                    y: tmp.y+popcorn_image.height/2 + (Math.random()*2-1) * popcorn_image.height/2,
                    img:popcorn_images[popcorn_index], 
                    accy: 1, 
                    speedx: tmp.speedx + 2*(Math.random()-1)*bonus, 
                    speedy: -4 +tmp.speedy + -4*(Math.random())*bonus, 
                    done: false, 
                    bad: false
                })
            }
        },
        start: function() {
            if (!ready) {
                setTimeout(ci.start,50);
                return;
            }
            ci.add_popcorn();
            setInterval(ci.tick, 1000/24);
        },
        tick: function() {
            man.eating = false;
            for (var i=0; i < popcorn.length ; i++) {
                popcorn[i].x = popcorn[i].x+popcorn[i].speedx;
                popcorn[i].y = popcorn[i].y+popcorn[i].speedy;
                if (popcorn[i].line%2 == 0 && (popcorn[i].x + popcorn[i].speedx + popcorn_image.width > width)) {
                    var tmpx = popcorn[i].speedx, 
                        tmpy = popcorn[i].speedy
                    popcorn[i].speedx = tmpy;
                    popcorn[i].speedy = tmpx;
                    popcorn[i].line += 1;
                    if (popcorn[i].line > max_lines) {
                        ci.explode_popcorn(i,true);
                    }
                }
                if (popcorn[i].line%2 == 1 && (popcorn[i].x + popcorn[i].speedx < 0)) {
                    var tmpx = popcorn[i].speedx, 
                        tmpy = popcorn[i].speedy
                    popcorn[i].speedx = tmpy;
                    popcorn[i].speedy = (tmpx<0)?-tmpx:tmpx;
                    popcorn[i].line += 1;
                    if (popcorn[i].line > max_lines) {
                        ci.explode_popcorn(i,true);
                    }
                }
                if (popcorn[i].y+popcorn[i].speedy > popcorn_image.height * (popcorn[i].line+1)) {
                    var tmpx = popcorn[i].speedx, 
                        tmpy = popcorn[i].speedy, 
                        odd = (popcorn[i].line%2 == 1);
                    popcorn[i].speedx = (odd)?-tmpy:tmpy;
                    popcorn[i].speedy = tmpx;
                }
            }
            for (var j=0; j < tiny_popcorn.length; j++) {
                if (!tiny_popcorn[j].done) {
                    tiny_popcorn[j].x += tiny_popcorn[j].speedx;
                    tiny_popcorn[j].y += tiny_popcorn[j].speedy;
                    tiny_popcorn[j].speedy += tiny_popcorn[j].accy;
                    if (tiny_popcorn[j].y > height-100) {
                        tiny_popcorn[j].bad = true;
                        tiny_popcorn[j].y = height-100;
                        tiny_popcorn[j].speedy = -tiny_popcorn[j].speedy*0.3;
                        tiny_popcorn[j].speedx = tiny_popcorn[j].speedx*0.5;
                        if (Math.abs(tiny_popcorn[j].speedy) < 1) {
                            tiny_popcorn[j].done = true;
                        }
                    }
                    if (tiny_popcorn[j].bad == false) {
                        if (tiny_popcorn[j].x > man.x && tiny_popcorn[j].x < man.x +man_image.width &&  
                            tiny_popcorn[j].y < man.y && tiny_popcorn[j].y > man.y - 20){
                            man.eating = true;
                            tiny_popcorn.splice(j,1);
                            man.score += 1;
                        }
                    }
                }
            }
            ci.redraw();
        }, 
        draw_score: function() {
            context.fillText("YOUR SCORE: "+ man.score, 0, 10);
        },
        redraw: function() {
            context.clearRect(0, 0, width, height); 
            ci.draw_background();
            ci.draw_popcorn();
            ci.draw_man();
            ci.draw_score();
        }
    }
    return ci;
})