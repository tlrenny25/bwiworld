/*

THIS WASN'T VIBE CODED
NOT ONE OUNCE OF AI SLOPPERY

*/
var $ = (a) => {return document.getElementById(a)}
let idcounter = 0;
let moving = false;
let target;
let announcements = [];
let poll;
var globalMute = false;
let coins = 0;
function movestart(mouse, self){
    if(moving) return;
    if(mouse.touches != undefined) mouse = mouse.touches[0];
    target = self;
    //Find offset of mouse to target
    target.offsetx = mouse.clientX - target.x;
    target.offsety = mouse.clientY - target.y;
    target.lx = target.x;
    target.ly = target.y;
    //Enable moving
    moving = window.cont == undefined;
}
//
function getUserProfileImage(color, name) {
    // If it's a crosscolor (URL)
    if(color && (color.startsWith("http://") || color.startsWith("https://"))) {
        // Return a default crosscolor icon instead of trying to load the URL as a profile
        return "./profiles/crosscolor.png";
    }
    // Check if the color exists as a profile image
    const validColors = ["purple", "blessed", "yellow", "red", "blue", "green", "pink", "brown", "orange", "magenta", "shadow", "gray", "maroon", "indigo", "teal", "gold", "violet",  "black", "cyan", "white", "shadow", "king", "pope"];
    if(validColors.includes(color)) {
        return `./profiles/${color}.png`;
    }
    // Fallback to crosscolor icon for any other invalid colors
    return "./profiles/crosscolor.png";
}
class msWindow{
    constructor(title, html, x, y, width, height, buttons){
        this.x = x;
        this.y = y;
        this.toppad = 0;
        this.w = !width ? "auto" : width;
        this.h = !height ? "auto": height;
        this.lx = x;
        this.ly = y;
        this.id = idcounter+"w";
        let btncounter = 0;
        idcounter++;
        if(buttons == undefined) buttons = [{name: "CLOSE"}]
        html+="<center class='buttonbar'>";
        buttons.forEach((button)=>{
            html+="<button class='msBtn' id='"+this.id+"b"+btncounter+"'>"+button.name+"</button> &nbsp; ";
            button.id = btncounter;
            btncounter++;
        })
        html+="</center>";
        document.getElementsByTagName("body")[0].insertAdjacentHTML("beforeend", `
            <div id='`+this.id+`p' style='top:`+y+`;left:`+x+`;height: `+height+`px;width: `+width+`px;max-width: 80%;' class='msWindow_cont'>
            <p id="`+this.id+`t" class='msWindow_title'>`+title+` &nbsp; <button class="log_close" id='`+this.id+`close'></button></p>
            <div class='msWindow_body'>`+html+`</div>
            </div>
            `);
        //Button function handler
        buttons.forEach((button)=>{
            $(this.id+"b"+button.id).onclick = ()=>{
                if(button.callback != undefined) button.callback();
                this.kill();
            };
        })
        $(this.id+"close").onclick = ()=>{this.kill()};
        //Move starter
        $(this.id+"t").addEventListener("mousedown", mouse=>{movestart(mouse, this)});
        $(this.id+"t").addEventListener("touchstart", mouse=>{movestart(mouse.touches[0], this)});
        this.w = $(this.id+"p").clientWidth+10;
        this.h = $(this.id+"p").clientHeight;
        this.check();

        //If x y undefined, center
        if(x == undefined && y == undefined){
          this.y = innerHeight/2 - $(this.id+"p").clientHeight/2;
          this.x = innerWidth/2 - $(this.id+"p").clientWidth/2;
          $(this.id+"p").style.top = this.y;
          $(this.id+"p").style.left = this.x;
        }

        //Force constant width
        $(this.id+"p").style.width = this.w;
    }
    update(){
        $(this.id+"p").style.left = this.x;
        $(this.id+"p").style.top = this.y;
    }
    kill(){
        $(this.id+"p").remove();
        if(announcements.includes(this)) announcements.splice(announcements.indexOf(this), 1);
        else if(poll == this) poll = undefined;
        delete this;
    }
    check(){
        if(this.x < 0) this.x = 0;
        else if(this.x > innerWidth - this.w-25) this.x = innerWidth - this.w-25;
        if(this.y < 0) this.y = 0;
        else if(this.y > innerHeight - this.h-50) this.y = innerHeight - this.h-50;
        this.update();
    }
}
var jsnotified = false;
async function getClipboard() {
    try {
      const text = await navigator.clipboard.readText();
      return text;
    } catch (err) {
      console.error("Failed to read clipboard contents: ", err);
    }
  }

async function clipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  }
    var resetSock = () => {
        socket.disconnect();
        setTimeout(() => {
        socket.connect();
//Clear previous event listeners
                socket.off("leave");
                socket.off("join");
                socket.off("update");
                socket.off("kick");
                socket.off("announce");
                socket.off("talk");
                socket.off("actqueue");
                socket.off("update_self");
                socket.off("banwindow");
                socket.off("rawdata");
                socket.off("window");
                //Setup
                socket.emit("login", {name: settings.name, color: settings.color, room: room});
        },1100);
    }
    var globalTrack;
    function playMusic(link,id){
        let y = () => {
         globalTrack = new Audio(link);
        globalTrack.play();
        $(id).innerHTML = "Pause";
        $(id).onclick= z;
        }
        y();
        let z = () => {
            $(id).innerHTML = "Play";
            globalTrack.pause();
            $(id).onclick = y;
        }
       
    }
    var firstInst = true;
    let socket = location.href.includes('mini') ? io(location.href.replace('/mini.html','')) : io(location.href);
    //delete io;
    let error_id = "error_disconnect";
    let level = 0;
    let welcomeversion = 6;
    let typestate = 0;
    let room = "";
    let censor = [/nigger/gi, /faggot/gi, /fuck/gi, /shit/gi, /slut/gi, /cunt/gi, /kike/gi, /goatse/gi, /kekma/gi, /ass/gi, /sex/gi, /cock/gi]
    let minx = 0;
    //0 = normal, 1 = DM, 2 = reply
    window.talkstate = 0;
    let talktarget = undefined;
    let mobile = innerWidth<=560;
    let stage;
    const agents = {
    };
    setInterval(()=>{Object.keys(agents).forEach(a=>{agents[a].pub.joined++})}, 60000)
    const settings = parseCookie(document.cookie);
    let useredit = {
        name: "",
        id: "",
        newname: "",
        newcolor: ""
    }
    /*
    let mouseevents = {
        mousemove: "mousemove",
        mousedown: "mousedown",
        mouseup: "mouseup"
    }
    if(mobile) mouseevents = {mousemove: "touchmove", mousedown: "touchstart", mouseup: "touchend"}
    */
  
  
    //The TTS library has a bug that may cause failure to stop current audio when new audio is made.
    //It was "fixed" by making all instances of TTS global and assigned a bonzi ID.
    window.tts = {};
    function stat(status){try{
        $("status").innerHTML = status;}catch(e)
    {}}
    //Type of each color
    const types = {
        "peedy": "peedy",
        "clippy": "clippy"
    }
    const colors = ["purple", "blessed", "yellow", "indigo", "magenta", "teal", "shadow", "violet", "gold", "maroon", "gray", "red", "blue", "green", "pink", "brown", "orange", "black", "cyan", "white", "king", "pope"];
  
    //Set up stylesheets
    const sheets = {
        bonzi:{
            spritew: 200,
            spriteh: 160,
            w: 3400,
            h: 3360,
            toppad: 0,
            anims: {
                idle: 0,
                enter: [277, 302, "idle", 0.25],
                   leave: [16, 39, 40, 0.25],
                grin_fwd: {frames: range(182, 189).concat([184]), next: "grin_back", speed: 0.25},
                grin_back: {frames: [183, 182], next: "idle", speed: 0.25},
                shrug_fwd: [40, 50, "shrug_idle", 0.25],
                shrug_idle: [50],
                shrug_back: {frames: range(40, 50).reverse(), speed: 0.25, next: "idle"},
                backflip: [331, 343, "idle", 0.25],
                swag_fwd: [108, 125, "swag_idle", 0.25],
                swag_idle: 125,
                swag_back: {frames: range(108, 125).reverse(), next: "idle", speed: 0.25},
                earth_fwd: [51, 56, "earth_idle", 0.25],
                earth_idle: [57, 80, "earth_idle", 0.25],
                earth_back: {frames: range(51, 58).reverse(), next: "idle", speed: 0.25},
                clap_fwd: {frames: [0, 10, 11, 12, 13, 14, 15, 13, 14, 15], next: "clap_back", speed: 0.25},
                clap_back: {frames: [13, 14, 15, 13, 14, 15, 12, 11, 10], next: "idle", speed: 0.25},
                beat_fwd: {frames: [0, 101, 102, 103, 104, 105, 106, 107, 104, 105, 106, 107], next: "beat_back", speed: 0.25},
                beat_back: { frames: [104, 105, 106, 107, 104, 105, 106, 107, 103, 102, 101], next: "idle", speed: 0.25},
                think_fwd: {frames: range(242, 247).concat([247, 247, 247, 247]), next: "think_back", speed: 0.25},
                think_back: {frames: range(242, 247).reverse(), next: "idle", speed: 0.25},
                bow_fwd: [224, 231, "bow_idle", 0.25],
                bow_idle: 232,
                bow_back: {frames: range(224, 232).reverse(), next: "idle", speed: 0.25},
                praise_fwd: [159, 163, "praise_idle", 0.25],
                praise_idle: 164,
                praise_back: {frames: range(159, 164).reverse(), next: "idle", speed: 0.25},
            },
        },
        //TODO: ADD PEEDY AND CLIPPY ANIMATIONS
        peedy: {
            spritew: 160,
            spriteh: 128,
            w: 4000,
            h: 4095,
            toppad: 12,
            anims: {
                idle: 0,
                enter: [659, 681, "idle", 0.25],
                leave: [23, 47, 47, 0.25],
                swag_fwd: [334, 347, "swag_idle", 0.25],
                swag_idle: 348,
                swag_back: {frames: range(334, 347).reverse(), next: "idle", speed: 0.25},
                bow_fwd: [625, 632, "bow_idle", 0.25],
                bow_idle: 632,
                bow_back: {frames: range(625, 632).reverse(), next: "idle", speed: 0.25},
                earth_fwd: [418, 429, "earth_idle", 0.25],
                earth_idle: [429],
                earth_back: {frames: range(418, 429).reverse(), next: "idle", speed: 0.25},
                shrug_fwd: [644, 649, "shrug_idle", 0.25],
                shrug_idle: 649,
                shrug_back: {frames: range(644, 649).reverse(), next: "idle", speed: 0.25},
                grin_fwd: [753, 763, "grin_back", 0.25],
                grin_back: {frames: range(753, 763).reverse(), next: "idle", speed: 0.25},
                clap_fwd: {frames: range(322, 331), next: "clap_back", speed: 0.25},
                clap_back: {frames: range(322, 331).reverse(), next: "idle", speed: 0.25},
            }
        },
        clippy: {
            spritew: 124,
            spriteh: 93,
            w: 3348,
            h: 3162,
            toppad: 40,
            anims: {
                idle: 0,
                enter: [410, 416, "idle", 0.25],
                leave: {frames: [0].concat(range(364, 411)), speed: 0.25},
                shrug_fwd: [199, 210, "shrug_idle", 0.25],
                shrug_idle: 210,
                shrug_back: {frames: range(199, 210).reverse(), next: "idle", speed: 0.25},
                bow_fwd: [1, 11, "bow_idle", 0.25],
                bow_idle: 11,
                bow_back: {frames: range(1, 11).reverse(), next: "idle", speed: 0.25}
            }
        },
    }
  
    const spritesheets = {};
    colors.forEach(color=>{
        if(types[color] != undefined){
            let sheet = sheets[types[color]];
            spritesheets[color] = new createjs.SpriteSheet({images: ["./img/agents/"+color+".png"], frames: {width: sheet.spritew, height: sheet.spriteh}, animations: sheet.anims})
  
        } else{
            spritesheets[color] = new createjs.SpriteSheet({images: ["./img/agents/"+color+".png"], frames: {width: 200, height: 160}, animations: sheets.bonzi.anims})
        }
    })
  
  function fixwrapper(cont){
    $('wrapper').innerHTML = $("ec_menu").innerHTML.replaceAll(`placeid=`,`id=`)+cont.replaceAll(`placeid=`,`id=`);
    if($("slots") !== null && myitems["upgrade_bsSlot"] !== undefined)$("slots").innerHTML=myitems["upgrade_bsSlot"].amt;
    setTimeout(() => {updateItems(); leaderboardUpdate();socket.emit("coins",{action:"getleader"});if($("Shekels") !== null)document.getElementById("Shekels").innerHTML = coins; },500);
  }
    //Client side commands
    const clientcommands = {
        "clear":()=>{
            document.getElementById('log_body').innerHTML='';
        },
        "settings": ()=>{
            new msWindow("Settings", `
                <datalist id="themes">
                    <option value="purple">
                    <option value="blue">
                    <option value="red">
                    <option value="green">
                    <option value="black">
                    <option value="windowsxp">
                </datalist>
  
                <table>
                <tr>
                <td class="side">
                <img src="./img/assets/settings.png">
                </td>
                <td>
                <span class="win_text">
                <table style="margin-left: 10px;">
                <tr><td>Name:</td><td><input id="autojoin_name" placeholder="name" value="${settings.name}"></td></tr>
                <tr><td>Color:</td><td><input id="color_name" value='${settings.color}'></td></tr>
                <tr><td>Background (URL):</td><td><input id='bgName' value='${settings.bg}'></td></tr>
                <tr><td>BonziCOIN Password</td><td><input id='bc_pass' value='${settings.pass}'></td></tr>
                <tr><td>Theme (URL):</td><td><input id="theme_name" placeholder="theme URL or name" list="themes" value="purple"></td></tr>
                <tr><td>Disable Crosscolors:</td><td><input type="checkbox" id="disCC" ${settings.disableCCs ? "Checked" : ""}></td></tr>
                <tr><td>Enable Autojoin:</td><td><input type="checkbox" id="autojoin" ${settings.autojoin ? "Checked" : ""}></td></tr>
                </table>
                <input type="submit" style="display:none;">
                </span>
                </td>
                </tr>
                </table>
                `, undefined, undefined, undefined, undefined, [{name: "ACCEPT", callback: ()=>{changeSettings($("disCC").checked, $("bgName").value, $("autojoin").checked, $("autojoin_name").value, $("theme_name").value, $("color_name").value,$("bc_pass"));location.reload();}}, {name: "CANCEL"}])
        },
        "applets": (applete) => {
            if(applete == "minibw")return;
            if(document.body.innerHTML.includes(` <button id="minibw" class="msBtn"style="max-height:60px;max-width:100px;">Open Mini BW`))return;

          new msWindow('Applets',`  
                  <h1>BonziWORLD Applets</h1>
                  <div id="appletsview">
                      <div class="applets_item">
                        <img src="/img/assets/radio.png" width="100" height="100"/>
                        <button id="jukebox" class="msBtn"style="max-height:60px;max-width:100px;">Jukebox</button>
                      </div>
                       <div class="applets_item">
                        <img src="/img/logo_readme.png" width="100" height="auto"/>
                        <button id="minibw" class="msBtn"style="max-height:60px;max-width:100px;">Mini BonziWORLD</button>
                      </div>
                      <div class="applets_item">
                        <img src="/img/assets/notepad.png" width="50" height="auto"/>
                        <button id="notepad" class="msBtn"style="max-height:60px;max-width:100px;">Notepad</button>
                      </div>
					                         <div class="applets_item">
                        <img src="/img/newlogo.png" width="100" height="auto"/>
                        <button id="bonzigay" class="msBtn"style="max-height:60px;max-width:100px;">Upload a File</button>
                      </div>
                      <div class="applets_item">
                        <img src="/img/assets/games.png" width="70" height="auto"/>
                        <button id="browser" class="msBtn"style="max-height:60px;max-width:100px;">Games</button>
                      </div>
                      
                  </div>
`, undefined, undefined, undefined, undefined, [
{name: "Close"}]);

          setTimeout(() => {
            ["jukebox","minibw","notepad","browser","bonzigay","tv"].forEach(applet => {
                $(applet).onclick = () => {clientcommands["applets_"+applet]();}
            });
            },1100);
            
        },
"applets_jukebox": () => {

    new msWindow(
        "Jukebox",
        `<p>The Jukebox Applet is currently being revamped. It will be back soon! While you wait, enjoy this Sneakers' O Toole video.</p>
		<br><br>
		<iframe width="560" height="315" src="https://www.youtube.com/embed/ZiQpG5zP_2g?si=mp8f5R_UgfNFtXiB" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`
    );
},
        "applets_minibw": () => {
            if(document.body.innerHTML.includes(`<button style="width:80px;height:30px;" class="msBtn" onclick="$('dialoguemini').innerText = 'Mini BonziWORLD';$('minicont').style.`))return;
            if($('content').innerHTML.includes('<iframe id="minicont"'))return;
            new msWindow('Mini BonziWORLD',`
                <div id="minicont"style="display:flex;flex-direction:column;width:max-content;max-width:`+(window.innerWidth/1.8)+`;">
                <p id="dialoguemini">Useful for things such as being in<br>multiple rooms or whatever.</p>
                <iframe src="index.html" width="`+(window.innerWidth/2)+`" height="400" frameborder="0">Loading...</iframe></div>
                    <button style="width:80px;height:30px;" class="msBtn" onclick="$('dialoguemini').innerText = 'Mini BonziWORLD';$('minicont').style.width = '30px';$('minicont').style.height = '30px';var r = this.onclick;this.innerText = 'Display Mini BW'; this.onclick = () => {this.onclick = r; $('minicont').style.width='`+(window.innerWidth/2+100)+`px'; $('minicont').style.height = '500px'; this.innerText = 'Hide Mini BW'};">Hide Mini BW</button>

                `, undefined, undefined, undefined, undefined, [
{name: "Close"}]);
        },
        "applets_notepad": () => {
        if($("content").innerHTML.includes(`<textarea style="width:400px;height:300px;font-family:Tahoma;`))return;
        new msWindow('Notepad',`
            <textarea style="width:200px;height:150px;font-family:Tahoma;" id="notepadcont"></textarea><br>
            <button class="msBtn" id="notepadcopy">Copy Text</button><br>
            <button class="msBtn" id="notepadpaste">Paste Text</button><br>
            <hr>
            <button class="msBtn" id="notepadrun">Run As Javascript</button>
            `, undefined, undefined, undefined, undefined, [{name: "Close"}]);
        setTimeout(() => {
                $("notepadcopy").onclick = () => {
                    if($("notepadcont").selectionStart === $("notepadcont").selectionEnd){alert("No text selected. Hold and drag to select text.");return;}
                    else {
                        clipboard($("notepadcont").value.substring($("notepadcont").selectionStart,$("notepadcont").selectionEnd));
                    }
                }
                $("notepadpaste").onclick = () => {
                    getClipboard().then(clipcont => {
                        var result = $("notepadcont").value.substring(0, $("notepadcont").selectionStart) + clipcont + $("notepadcont").value.substring($("notepadcont").selectionStart, $("notepadcont").value.length);
                        $("notepadcont").value = result;
                    });
                    
                }
                $("notepadrun").onclick = () => {
                    try {
                        eval($("notepadcont").value);
                        } catch(e) {
                            alert(e);
                        }
                }
        },1100);
    },
    "applets_bonzigay":()=>{
        if(document.body.innerHTML.includes(`id="erik"`))return;
        new msWindow(`Upload a File`,`
             <iframe src="https://bonziupload.qzz.io/bwiworldembed.html" width="720" frameborder="0" scrolling="no" height="380" id="erik"></iframe>
        `,undefined,undefined,undefined,undefined,[]);
    },
    "applets_coins": (tab) => {
        if(document.body.innerHTML.includes(`id="wrapper"`))return;
        function fixwrapper(cont){
            $('wrapper').innerHTML = $("ec_menu").innerHTML.replaceAll(`placeid=`,`id=`)+cont.replaceAll(`placeid=`,`id=`);
          }
          
        new msWindow(`<span><img src="./img/shekel.gif" width="20" height="auto"></span>&nbsp;
BonziCOINS Menu `,`
             
                
                <div class="wrapper" id="wrapper" onload="alert('piss')" style="width:420px;height:380px;padding:1px;margin:0;overflow-y:scroll;">
                ${$("ec_menu").innerHTML.replaceAll(`placeid=`,`id=`)}
                
                ${$("ec_main").innerHTML.replaceAll(`placeid=`,`id=`)}
                </div>
                <div style="width:200px;height:40px;color:white;background-color:black;position:relative;padding:0px;margin:-20px 0px;">
                    <h5 id="status" style="font-size:14px;font-family:monospace;font-weight:lighter;"></h5>
                </div>
        `,undefined,undefined,undefined,undefined,[]);
        updateItems();
    $("shop").onclick = () => {fixwrapper($("ec_shop").innerHTML); $("shop").onclick =  $("shop").onclick;}; 
    $("items").onclick = () => {fixwrapper($("ec_items").innerHTML); $("items").onclick =  $("items").onclick;}
    },
"applets_browser": () => {
        new msWindow(`Games`,`
            <iframe src="./games.html" width="980" height="500" frameborder="0" id="gaming"></iframe>
            <br><br>

            <button onclick="FullScreen()" class="msBtn">Enter Fullscreen</button> | 
            <button onclick="Return()" class="msBtn">Return to Games</button>
        `,undefined,undefined,undefined,undefined,[]);
    },
    "applets_tv":()=>{
        if(document.body.innerHTML.includes(`id="erik"`))return;
        new msWindow(`Upload a File`,`
             <iframe src="https://bonziupload.qzz.io/bwiworldembed.html" width="720" frameborder="0" scrolling="no" height="380" id="erik"></iframe>
        `,undefined,undefined,undefined,undefined,[]);
    },
    "applets_games": ()=>{

    },
       "rooms": () => {
         new msWindow(`Rooms Manager`,`
                <img src="/icons/changeroom.png" width="60"height="60"></img>
                <input type="text" placeholder="Enter Room ID Here..." id="newroom">
        `,undefined,undefined,undefined,undefined,[{name:"Go",callback:()=>{
            room = $("newroom").value;
            resetSock();
            $("error_page").style.visibility = "hidden";
            setTimeout(() => {$("error_page").style.visibility = "visible";},5000);
        }}])
       }
    }
  
  
  socket.on("deletemsg", (msgid)=>{
    let el = document.getElementById(msgid);
    if(!el) return;
    el.innerHTML = `<i style="color:gray;font-size:12px;">[content deleted]</i>`;
});
    function pushlog(text, guid, msgid){
    var toscroll = $("log_body").scrollHeight - $("log_body").scrollTop < 605;
    msgid = msgid || ("msg_" + Date.now() + "_" + Math.floor(Math.random()*9999));
    let div = document.createElement("div");
    div.id = msgid;
    div.style.cssText = "position:relative;padding:2px 20px 2px 2px;margin-bottom:2px;";
    if(guid) div.dataset.guid = guid;
    div.innerHTML = text;
    if(level >= 2){
        let btn = document.createElement("span");
        btn.style.cssText = "position:absolute;top:2px;right:4px;cursor:pointer;color:red;font-size:11px;opacity:0.4;user-select:none;";
        btn.innerText = "✕";
        btn.onmouseover = ()=>{ btn.style.opacity = "1"; };
        btn.onmouseout = ()=>{ btn.style.opacity = "0.4"; };
        btn.onclick = ()=>{ socket.emit("deletemsg", msgid); };
        div.appendChild(btn);
    }
    $("log_body").appendChild(div);
    if(toscroll) $("log_body").scrollTop = $("log_body").scrollHeight;
}

socket.on("deletemsg", (msgid)=>{
    let el = document.getElementById(msgid);
    if(!el) return;
    el.innerHTML = `<i style="color:gray;font-size:12px;">[content deleted]</i>`;
});

socket.on("deletemsgbyguid", (guid)=>{
    let msgs = document.querySelectorAll(`[data-guid="${guid}"]`);
    msgs.forEach(el=>{
        el.innerHTML = `<i style="color:gray;font-size:12px;">[content deleted]</i>`;
    });
});
  
    function FullScreen() {
    const iframe = document.getElementById("gaming");

    if (iframe.requestFullscreen) {
        iframe.requestFullscreen();
    } else if (iframe.webkitRequestFullscreen) { 
        iframe.webkitRequestFullscreen();
    } else if (iframe.msRequestFullscreen) {
        iframe.msRequestFullscreen();
    }
}

function Return() {
    const iframe = document.getElementById("gaming");
    iframe.src = "games.html";
}

function toggleMute(btn) {
    const frame = document.getElementById('gaming');
    
    try {
        const innerDoc = frame.contentDocument || frame.contentWindow.document;
        const mediaElements = innerDoc.querySelectorAll('video, audio');
        
        if (btn.innerText === "Mute") {
            mediaElements.forEach(el => el.muted = true);
            btn.innerText = "Unmute";
        } else {
            mediaElements.forEach(el => el.muted = false);
            btn.innerText = "Mute";
        }
    } catch (e) {
        console.error("You are grounded!.");
        alert("Something fucked.");
    }
}
	
	//Primitive approach to linkifying a message
    function linkify(msg){
        //Don't linkify HTML messages
        if(msg.includes("<")) return msg;
  
        msg = msg.split(" ");
        let nmsg = [];
        msg.forEach(word=>{
            if(word.startsWith("http://") || word.startsWith("https://")){
                nmsg.push("<a href='"+word+"' target='_blank'>"+word+"</a>")
            }
            else nmsg.push(word);
        })
        return nmsg.join(" ");
    }
  
    
    class agent{
        constructor(x, y, upub){
            let id = upub.guid;
            let image = upub.color;
            let sheet = sheets[image] == undefined ? sheets["bonzi"] : sheets[image];
            this.x = x;
            this.y = y;
            this.ttsmute = false;
            this.toppad = sheet.toppad;
            this.w = sheet.spritew;
            this.h = sheet.spriteh;
            this.anims = sheet.anims;
            this.id = upub.guid;
            this.lx = x;
            this.ly = y;
            this.pub = upub;
  
            if(image.startsWith("http") && (settings.disableCCs || settings.under)) image="purple";
            if(spritesheets[image] == undefined){
                let img = new Image();
                img.crossOrigin = "user";
                img.src = image;
                let spritesheet = new createjs.SpriteSheet({images: [img], frames: {width: 200, height: 160}, animations: sheets.bonzi.anims})
                this.sprite = new createjs.Sprite(spritesheet, "enter");
            }
            else this.sprite = new createjs.Sprite(spritesheets[image], "enter");
            this.sprite.x = x;
            this.sprite.y = y+this.toppad;
            stage.addChild(this.sprite);
  
            let bubbleclass = (x > innerWidth/2-this.w/2) ? "bubble-left" : "bubble-right";
            if(mobile) bubbleclass = (y > innerHeight/2-this.h/2) ? "bubble-top" : "bubble-bottom";
            $("agent_content").insertAdjacentHTML("beforeend", `
                <div id='`+id+`p' style='margin-top:`+y+`;margin-left:`+x+`;height: `+(this.h+sheet.toppad)+`px;width: `+this.w+`px;' class='agent_cont'>
                <span class='tag' id='`+id+`tg'></span>
                <span class='nametag' id='`+id+`n'><span id='`+id+`nn'>`+this.pub.dispname+`</span><span id='`+id+`nt'>`+`<br>&nbsp;&nbsp;(<span><img src='./img/shekel.gif' width='14' height='auto'></span> ${this.pub.coins})`+`</span></span>
                <span class='`+bubbleclass+`' style='display: none;' id='`+id+`b' >
                <div id='`+id+`t' class='bubble_text'></div>
                </span>
                <div style='width:${this.w};height:${this.h};' id='${this.id}c'></div>
                <div style='width:${this.w};height:${this.h};background-size:100%;pointer-events:none;margin-left:0px;' id='${this.id}hat'></div>
                </div>
                `);
            this.parent = $(this.id+"p");
            $(id+"c").onclick = ()=>{if(this.lx == this.x && this.ly == this.y) this.cancel()};
            if(this.pub.tagged){
                $(id+"tg").style.display = "inline-block";
                $(id+"tg").innerHTML = this.pub.tag;
            }
  
            //Move starter
            $(id+"c").addEventListener("mousedown", mouse=>{movestart(mouse, this)});
            $(id+"c").addEventListener("touchstart", mouse=>{movestart(mouse.touches[0], this)});
        }
        update(){
            this.parent.style.marginLeft = this.x;
            this.parent.style.marginTop = this.y;
            this.sprite.x = this.x;
            this.sprite.y = this.y+this.toppad;
        }
        hat(url,q){
            if(q == undefined)q = "";
            $(this.id+"hat"+q).style.backgroundImage = "url("+url+")";
        }
        change(image){
            this.cancel();
            let sheet = sheets[types[image]];
            let spritesheet;
            if(image.startsWith("http")){
                if(settings.disableCCs){
                    image="purple";
                    spritesheet = spritesheets["purple"];
                }
                else{
                    let img = new Image();
                    img.crossOrigin = "user";
                    img.src = image;
                    //Make new sheet
                    spritesheet = new createjs.SpriteSheet({images: [img], frames: {width: 200, height: 160}, animations: sheets.bonzi.anims})
                }
            } else spritesheet = spritesheets[image];
            if(sheet == undefined) sheet = sheets["bonzi"];
            this.w = sheet.spritew;
            this.h = sheet.spriteh;
            this.toppad = sheet.toppad;
            this.pub.color = image;
  
            //Re-size parent
            $(this.id+"p").style.width = this.w;
            $(this.id+"p").style.height = this.h+sheet.toppad;
            $(this.id+"c").style.width = this.w;
            $(this.id+"c").style.height = this.h;
  
            //Re-create styleobject
            stage.removeChild(this.sprite);
            this.anims = sheet.anims;
            this.sprite = new createjs.Sprite(spritesheet, "idle");
            this.update();
            stage.addChild(this.sprite);
  
            poscheck(this.id);
        }
        talk(write, say, msgid){
    this.cancel();
    setTimeout(()=>{
        $(this.id+"b").style.display = "block"
        
        // Check for ANY embeddable media
        const hasEmbed = write.includes('spotify.com') || 
                        write.includes('open.spotify.com') ||
                        write.includes('youtube.com') || 
                        write.includes('youtu.be') ||
                        write.includes('soundcloud.com') ||
                        write.includes('vimeo.com') ||
                        write.match(/\.(mp3|wav|ogg|m4a|mp4|webm|mov|jpg|jpeg|png|gif|webp)(\?|$)/i) ||
                        write.includes('<iframe') ||
                        write.includes('<video') ||
                        write.includes('<audio');
        
        if(hasEmbed) {
            $(this.id+"b").classList.add('embed-mode');
            this.embedMode = true;  // STORE IT ON THE AGENT
        } else {
            $(this.id+"b").classList.remove('embed-mode');
            this.embedMode = false; // STORE IT ON THE AGENT
        }
        
        if(say.startsWith("-") || this.ttsmute) say="";
        else say = desanitize(say).replace(/[!:;]/g, '').replace(/ etc/gi, "E T C").replace(/ eg/gi, "egg");
        if(say != "" && !globalMute) speak.play(say, this.id, this.pub.voice, ()=>{
            delete window.tts[this.id];
            $(this.id+"b").style.display = "none";
            $(this.id+"b").classList.remove('embed-mode');
        })
        $(this.id+"t").innerHTML = linkify(write);
        $(this.id+"t").style.maxHeight = hasEmbed ? "2000px" : "175px";

        pushlog("<div style='width:30px;height:30px;overflow:hidden;border:1px solid black;border-radius:30px;'><img src='"+(this.pub.color.startsWith("http") ? "./profiles/crosscolor.png" : "./profiles/"+this.pub.color+".png")+"' width='40' height='auto'></div><p style='color:gray;font-size:14px;'>"+getCurrentTime()+"</p><font color='"+this.pub.color+"'>"+this.pub.name+": </font>"+linkify(write), this.id, msgid);
    }, 100)
}
        actqueue(list, i){
            if(i == 0) this.cancel();
            if(i >= list.length) return;
            if(list[i].say == undefined) list[i].say = list[i].text;
            if(list[i].type == 0){
                setTimeout(()=>{
                    if(settings.under) censor.forEach(c=>{
                      list[i].text = list[i].text.replaceAll(c, "****");
                      if(list[i].say != undefined) list[i].say = list[i].say.replaceAll(c, "")
                    })
                    $(this.id+"t").innerHTML = linkify(list[i].text);
                    $(this.id+"b").style.display = "block"
                    if(!this.ttsmute && !globalMute) speak.play(list[i].say.replace(/[!:;]/g, '').replace(/ etc/gi, "E T C").replace(/ eg/gi, "egg"), this.id, this.pub.voice, ()=>{
                        delete window.tts[this.id];
                        $(this.id+"b").style.display = "none";
                        i++;
                        this.actqueue(list, i);
                    })
                    else{
                      setTimeout(()=>{
                        delete window.tts[this.id];
                        $(this.id+"b").style.display = "none";
                        i++;
                        this.actqueue(list, i);
                      }, 2000)
                    }
                    pushlog("<font color='"+this.pub.color+"'>"+this.pub.name+": </font>"+list[i].text);
                }, 100);
            } else{
                if(this.anims[list[i].anim] == undefined){
                    i++;
                    this.actqueue(list, i);
                    return;
                }
                let animlen = this.anims[list[i].anim].frames != undefined ? this.anims[list[i].anim].frames.length : this.anims[list[i].anim][1] - this.anims[list[i].anim][0]
                this.sprite.gotoAndPlay(list[i].anim)
                setTimeout(()=>{
                    i++;
                    this.actqueue(list, i);
                }, 1000/15*animlen)
            }
        }
        kill(playignore){
            this.cancel();
            if(!playignore){
                this.sprite.gotoAndPlay("leave");
                let animlen = 1000/15*(this.anims.leave[1] - this.anims.leave[0]) ;
                setTimeout(()=>{
                    stage.removeChild(this.sprite);
                    $(this.id+"p").remove();
                }, animlen)
            }
            else{
                stage.removeChild(this.sprite);
                $(this.id+"p").remove();
            }
            delete agents[this.id];
        }
        cancel(){
            $(this.id+"b").style.display = "none";
            $(this.id+"t").innerHTML = '';
            if(window.tts[this.id] != undefined && window.tts[this.id].started){
                window.tts[this.id].stop();
                window.tts[this.id] = undefined;
            }
            else if(window.tts[this.id] != undefined){
                window.tts[this.id].start = ()=>{};
                window.tts[this.id] = undefined;
            }
            this.sprite.stop();
            this.sprite.gotoAndPlay("idle");
            //If left, remove (BUG FIX)
            if(agents[this.id] == undefined){
                stage.removeChild(this.sprite);
                $(this.id+"p").remove();
            }
        }
    }
  
    function poscheck(agent){
    agent = agents[agent];
    if(agent.x > innerWidth-agent.w) agent.x = innerWidth - agent.w;
    if(agent.y > innerHeight-32-agent.h) agent.y = innerHeight - 32 - agent.h;
    
    var bubble = $(agent.id+"b");
    if(!bubble) return;
    
    // Determine the new direction class
    var newDir = "";
    if(agent.x > innerWidth/2-agent.w/2 && !mobile) newDir = "bubble-left";
    else if(!mobile) newDir = "bubble-right";
    else if(agent.y > innerHeight/2-agent.h/2) newDir = "bubble-top";
    else newDir = "bubble-bottom";
    
    // Remove ONLY direction classes, keep everything else (like embed-mode)
    bubble.classList.remove("bubble-left", "bubble-right", "bubble-top", "bubble-bottom");
    bubble.classList.add(newDir);
    
    agent.update();
}
  
  
  
    function mousemove(mouse){
    if(!moving || (mouse.touches == undefined && innerWidth<innerHeight)) return;
    if(mouse.touches != undefined) mouse = mouse.touches[0];
    
    // Store embed state BEFORE any changes
    var wasEmbed = false;
    if($(target.id+"b")) {
        wasEmbed = $(target.id+"b").classList.contains('embed-mode');
    }
    
    // Find new x
    target.x = Math.max(minx, Math.min(innerWidth-target.w, mouse.clientX - target.offsetx))
  
    // Find new y
    target.y = Math.max(0, Math.min(innerHeight-target.h-32, mouse.clientY - target.offsety));
  
    // Update bubble position
    if($(target.id+"b") != undefined){
        if(mobile) {
            $(target.id+"b").className = target.y > innerHeight/2-target.h/2 ? "bubble-top" : "bubble-bottom";
        } else {
            $(target.id+"b").className = target.x > innerWidth/2-target.w/2 ? "bubble-left" : "bubble-right";
        }
        
        // Restore embed mode if it was there
        if(wasEmbed) {
            $(target.id+"b").classList.add('embed-mode');
        }
    }
    target.update();
}
    function mouseup(mouse){
        moving = false;
    }
  
    function movehandler(){
        //Moving
        document.addEventListener("mousemove", mousemove)
        document.addEventListener("mouseup", mouseup)
        document.addEventListener("touchmove", mousemove)
        document.addEventListener("touchend", mouseup)
  
        //On resize
        window.addEventListener("resize", ()=>{
            $("bonzicanvas").width = innerWidth;
            $("bonzicanvas").height = innerHeight;
            stage.updateViewport(innerWidth, innerHeight);
              Object.keys(agents).forEach(poscheck)
        })
  
        document.addEventListener("contextmenu", mouse=>{
            moving = false;
            mouse.preventDefault();
            //Find agent the mouse is over
            let bid = -1;
            Object.keys(agents).forEach((akey)=>{
                //Check if within bounds of an agent. Pretty long condition.
                if(
                    mouse.clientX > agents[akey].x &&
                    mouse.clientX < agents[akey].x + agents[akey].w &&
                    mouse.clientY > agents[akey].y &&
                    mouse.clientY < agents[akey].y + agents[akey].h + agents[akey].toppad
                ) bid = akey;
            })
  
            //Contextmenu if found passing agent through
            if(bid>-1){
                //Define the contextmenu upon click (so it can be dynamic)
                let cmenu = [
                    {
                        type: 0,
                        name: "Cancel",
                        callback: (passthrough)=>{
                            passthrough.cancel();
                        }
                    },
                    {
                        type: 0,
                        name: agents[bid].ttsmute ? "Unmute TTS" : "Mute TTS",
                        callback: (passthrough)=>{
                          passthrough.ttsmute = !passthrough.ttsmute;
                        }
                    },
                    {
                        type: 0,
                        name: "Get Stats",
                        callback: (passthrough)=>{
                            new msWindow(passthrough.pub.name+"'s stats", `
                            <table>
                            <tr>
                            <td class="side">
                            <img src="./img/assets/lookup.ico">
                            </td>
                            <td>
                            <span class="win_text">
                            <table style="margin-left: 15px;">
                            <tr><td>Name:</td><td>${passthrough.pub.name}</td></tr>
                            <tr><td>Color:</td><td>${passthrough.pub.color}</td></tr>
                            <tr><td>Joined:</td><td>${passthrough.pub.joined} minutes ago</td></tr>
                            <tr><td>GUID:</td><td>${passthrough.id}</td></tr>
                            </table>
                            </span>
                            </td>
                            </tr>
                            </table>`);
                        }
                    },
                    {
                      type: 1,
                      name: "Messages",
                      items: [
                        {
                            type: 0,
                            name: "Hail",
                            callback: (passthrough)=>{
                                socket.emit("command", {command: "hail", param: passthrough.pub.name});
                            }
                        },
                        {
                            type: 0,
                            name: "Direct Message",
                            callback: (passthrough)=>{
                                window.talkstate = 1;
                                $("talkcard").innerHTML = "Sending a private message to "+passthrough.pub.name+" <i class='fa fa-times' onclick='this.parentElement.style.display=\"none\";window.talkstate=0;'></i>";
                                talktarget = passthrough.id;
                                $("talkcard").style.display = "inline-block";
                            }
                        },
                        {
                            type: 0,
                            name: "Reply",
                            callback: (passthrough)=>{
                                window.talkstate = 2;
                                $("talkcard").innerHTML = "Replying to "+passthrough.pub.name+" <i class='fa fa-times' onclick='this.parentElement.style.display=\"none\";window.talkstate=0;'></i>";
                                talktarget = passthrough.id;
                                $("talkcard").style.display = "inline-block";
                            }
                        },
                        {
                            type: 0,
                            name: "Hey, NAME!",
                            callback: (passthrough)=>{
                                socket.emit("talk", `Hey, ${passthrough.pub.name}!`);
                            }
                        },
                      ]
                    },
                    {type:0, name:"Gift Coins", callback:(usar)=>{
    showGiftWindow(usar);
}},
                    {
                        type: 1,
                        name: "Insults",
                        items: [
                            {
                                type: 0,
                                name: settings.under ? "BLOCKED" : "Call an Asshole",
                                callback: (passthrough)=>{
                                    socket.emit("command", {command: "asshole", param: passthrough.pub.name})
                                }
                            },
                            {
                                type: 0,
                                name: "Tell to STFU",
                                callback: (passthrough)=>{
                                    socket.emit("talk", passthrough.pub.name+" shut the fuck up," + (Math.random()>0.5 ? " because I'm tired of your bullshit" : " NOW!"));
                                }
                            },
                            {
                                type: 0,
                                name: "Call a Stupid Bitch",
                                callback: (passthrough)=>{
                                    socket.emit("talk", passthrough.pub.name+" You're a stupid bitch! You're a stupid fucking bitch! I can't believe how dumb you are...")
                                }
                            },
                        ]
                    }
                ]
                if(level >= 1){
                    cmenu.push({
                        type: 1,
                        name: "Fun (MOD)",
                        items: [
                            {
                                type: 0,
                                name: "Toggle Bless",
                                callback: (passthrough)=>{
                                    socket.emit("command", {command: "bless", param: passthrough.id})
                                }
                            },
														                            {
                                type: 0,
                                name: "Start Streaming",
                                callback: (passthrough)=>{
                                    socket.emit("command", {command: "stream", param: passthrough.id})
                                }
                            },
                            {
                                type: 0,
                                name: "User Edit",
                                callback: (passthrough)=>{
                                    useredit.name = passthrough.pub.name;
                                    useredit.id = passthrough.id;
                                    showUserEdit();
                                }
                            },
                        ]
                    })
  
                    cmenu.push({
                      type: 1,
                      name: "Moderation (MOD)",
                      items: [
                          {
                              type: 0,
                              name: agents[bid].pub.locked ? "Stat Unlock" : "Stat Lock",
                              callback: (passthrough)=>{
                                  socket.emit("command", {command: "statlock", param: passthrough.id})
                              }
                          },
                          {
                              type: 0,
                              name: agents[bid].pub.muted ? "Unmute" : "Mute",
                              disabled: level <= 1,
                              callback: (passthrough)=>{
                                  socket.emit("command", {command: "mute", param: passthrough.id});
                              }
                          },
                          {
                              type: 0,
                              name: "Silent Mute",
                              disabled: level <= 1,
                              callback: (passthrough)=>{
                                  socket.emit("command", {command: "smute", param: passthrough.id})
                              }
                          },
                          {
                              type: 0,
                              name: "Blacklist Crosscolor",
                              disabled: level <= 2,
                              callback: (passthrough)=>{
                                  socket.emit("command", {command: "blacklistcc", param: passthrough.id})
                              }
                          },
                          {
                              type: 0,
                              name: "Kick",
                              disabled: level <= 1,
                              callback: (passthrough)=>{
                                  socket.emit("command", {command: "kick", param: passthrough.id})
                              }
                          },
                          {
                              type: 0,
                              name: "Advanced Info",
                              disabled: level <= 2,
                              callback: (passthrough)=>{
                                  socket.emit("command", {command: "advinfo", param: passthrough.id})
                              }
                          },
                          {
                              type: 0,
                              name: "BAN",
                              disabled: level <= 2,
                              callback: (passthrough)=>{
                                socket.emit("command", {command: "banmenu", param: passthrough.id})
                              }
                          },
                      ]
                    })
                }
                if(level >= 4){
                    cmenu.push({
                        type: 1,
                        name:"Gamer POPE CMD",
                        items: [
                            {
                                type: 0,
                                name: "Set Tag",
                                callback: (passthrough)=>{
                                    new msWindow("Change Tag", `
                                        <h1>Change ${passthrough.pub.name}'s tag</h1>
                                        <input id="new_tag">
                                    `, 60, 60, innerWidth-120, undefined, [{name: "SUBMIT", callback: ()=>{socket.emit("command", {command: "tagsom", param: passthrough.id+" "+$("new_tag").value})}}, {name: "cancel"}])
                                }
                            },
                            {
                type: 0,
                name: "LARP Detector",
                callback: (passthrough)=>{
                    socket.emit("command", {command: "larpdetect", param: passthrough.id});
                }
                            },
                        ]
                    })
                }
                window.cont = contextmenu(cmenu, mouse.clientX, mouse.clientY, agents[bid], window.cont);
            }
        })
    }
  
    function talk(){
        let say = $("chatbar").value;
        if(window.talkstate == 2){
            $("talkcard").style.display = "none";
            window.talkstate = 0;
            socket.emit("command", {command: "reply", param: talktarget+" "+say});
        }
        else if(window.talkstate == 1){
            $("talkcard").style.display = "none";
            window.talkstate = 0;
            socket.emit("command", {command: "dm", param: talktarget+" "+say});
        }
        else if(say.startsWith("/")){
            //Parse command
            let cmd = say.split(" ");
            let command = cmd[0].substring(1);
            if(command == "hat")alert("You cannot use /hat. Use hats in BonziCOINS Menu in your items, or buy one in the shop.")
            cmd.splice(0, 1);
            let param = cmd.join(" ");
            if(typeof clientcommands[command] != "function") socket.emit("command", {command: command, param: param});
            else clientcommands[command](param);
            if(command == "kingmode" || command == "godmode"){
                settings.autorun = {command: command, param: param};
                document.cookie = compileCookie(settings);
            }
        } else if(say.startsWith("https://youtube.com/watch?v=") || say.startsWith("https://www.youtube.com/watch?v=")  || say.startsWith("https://youtu.be/")){
            socket.emit("command", {command: "youtube", param: say});
        }else{
           socket.emit("talk", say);
        }
        $("chatbar").value = "";
    }
  
    var settingse = false;
    socket.on("alert",(alrt)=>{
        if(alrt.alert !== "off"){
            banner.style.visibility="visible";
        banner.innerHTML = "ALERT: " + alrt.alert;
        } else {
            banner.style.visibility="hidden";
        }
    });
    let lastcoin = coins;
    socket.on("stat",data=>{
        stat(data);
    });
    let myitems = {};
    socket.on("newitem",data=>{
        if(myitems[data.id] ==undefined){myitems[data.id] = data;}
        else {myitems[data.id].amt+=data.amt;}
        updateItems();
    });socket.on("deplete",data=>{
        myitems[data].amt--;
        updateItems();
    });
    function updateItems(){
        if($('itemlist') == null)return;
        $("itemlist").innerHTML="<li>Items Here...</li>";
        let itemlist = Object.keys(myitems);
        itemlist.forEach(itemkey=>{
            let data = myitems[itemkey];
            if(data.amt >0)$("itemlist").innerHTML+=`<li id="${data.id}"></li>`;$(data.id).innerHTML=`<button class="msBtn"id="${data.id}" onclick="socket.emit('useitem','${data.id}')">${data.name} (${data.amt})</button>`
        });
    }
    function getCurrentTime() {
        const now = new Date();
        
        // Get hours in 12-hour format
        let hours = now.getHours();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // Convert 0 to 12
        
        // Get minutes and pad with leading zero if needed
        const minutes = now.getMinutes().toString().padStart(2, '0');
        
        // Return formatted time string
        return `${hours}:${minutes} ${ampm}`;
      }
    socket.on("coins",data=>{
        
        lastcoin = coins;
        if(typeof data =="number"){coins=data;let coine = new Audio('coin.mp3');if(coins-lastcoin > 3)coine.play();}
       
        if(typeof data=="object"){
            agents[data.guid].pub.coins = data.amt;
            $(agents[data.guid].pub.guid+"nt").innerHTML ="<br>&nbsp;&nbsp;(<span><img src='./img/shekel.gif' width='18' height='auto'></span> "+data.amt+")"
        }
        if($("Shekels") !== null)document.getElementById("Shekels").innerHTML = coins; 
         //console.log("coins: "+coins); 
         leaderboardUpdate();
    });/**
    * Creates a canvas element and draws a graph visualizing normalized data points
    * @param {Array<number>} data - Array of numbers between 0 and 1 to visualize
    * @returns {HTMLCanvasElement} - The canvas element with the visualization
    */
   function getVisual(data) {
       // Canvas dimensions
       let daylist = ['Sun','Mon','Tues','Wed','Thurs','Fri','Sat']
       const width = 300;
       const height = 280;
       const padding = 30;
       
       // Create canvas element
       const canvas = document.createElement('canvas');
       canvas.width = width;
       canvas.height = height;
       canvas.style.backgroundColor = '#f8fafc';
       
       // Get 2D context
       const ctx = canvas.getContext('2d');
       
       // Calculate drawing dimensions
       const drawWidth = width - (padding * 2);
       const drawHeight = height - (padding * 2);
       
       // Draw grid
       ctx.strokeStyle = '#e2e8f0';
       ctx.lineWidth = 1;
       
       // Horizontal grid lines
       for (let i = 0; i <= 4; i++) {
         const y = padding + (drawHeight / 4) * i;
         ctx.beginPath();
         ctx.moveTo(padding, y);
         ctx.lineTo(width - padding, y);
         ctx.stroke();
         
         // Add y-axis labels
         ctx.fillStyle = '#64748b';
         ctx.font = '10px Arial';
         ctx.textAlign = 'right';
         ctx.fillText((1 - i * 0.25).toFixed(2), padding - 5, y + 3);
       }
       
       // Draw the axes
       ctx.strokeStyle = '#94a3b8';
       ctx.lineWidth = 2;
       
       // Y-axis
       ctx.beginPath();
       ctx.moveTo(padding, padding);
       ctx.lineTo(padding, height - padding);
       ctx.stroke();
       
       // X-axis
       ctx.beginPath();
       ctx.moveTo(padding, height - padding);
       ctx.lineTo(width - padding, height - padding);
       ctx.stroke();
       
       // Draw data points and lines
       if (data && data.length > 0 && data[i] > -0.1) {
         const xStep = drawWidth / (data.length - 1 || 1);
         
         // Draw lines between points
         ctx.beginPath();
         ctx.strokeStyle = '#2563eb'; // blue line
         ctx.lineWidth = 2;
         
         for (let i = 0; i < data.length; i++) {
           const x = padding + i * xStep;
           const y = height - padding - (data[i] * drawHeight);
           
           if (i === 0) {
             ctx.moveTo(x, y);
           } else {
             ctx.lineTo(x, y);
           }
         }
         ctx.stroke();
         
         // Draw peaks and drops
         for (let i = 0; i < data.length; i++) {
           const x = padding + i * xStep;
           const y = height - padding - (data[i] * drawHeight);
           
           // Determine if this point is a peak or drop
           let isPeak = false;
           let isDrop = false;
           
           if (i > 0 && i < data.length - 1) {
             isPeak = data[i] > data[i-1] && data[i] > data[i+1];
             isDrop = data[i] < data[i-1] && data[i] < data[i+1];
           }
           
           // Draw the point
           ctx.beginPath();
           if (isPeak) {
             ctx.fillStyle = '#dc2626'; // red for peaks
             ctx.arc(x, y, 5, 0, Math.PI * 2);
           } else if (isDrop) {
             ctx.fillStyle = '#16a34a'; // green for drops
             ctx.arc(x, y, 5, 0, Math.PI * 2);
           } else {
             ctx.fillStyle = '#2563eb'; // blue for regular points
             ctx.arc(x, y, 3, 0, Math.PI * 2);
           }
           ctx.fill();
           
           // Add index labels below x-axis if not too many points
           if (data.length <= 15) {
             ctx.fillStyle = '#64748b';
             ctx.font = '10px Arial';
             ctx.textAlign = 'center';
             ctx.fillText(i.toString(), x, height - padding + 15);
           }
         }
         
         // Add data value labels for peaks and drops
         ctx.font = '10px Arial';
         ctx.textAlign = 'center';
         
         for (let i = 0; i < data.length; i++) {
           const x = padding + i * xStep;
           const y = height - padding - (data[i] * drawHeight);
           
           // Determine if this point is a peak or drop
           let isPeak = false;
           let isDrop = false;
           
           if (i > 0 && i < data.length - 1) {
             isPeak = data[i] > data[i-1] && data[i] > data[i+1];
             isDrop = data[i] < data[i-1] && data[i] < data[i+1];
           }
           
           // Add value label above peak or below drop
           if (isPeak || isDrop) {
             ctx.fillStyle = isPeak ? '#dc2626' : '#16a34a';
             const labelY = isPeak ? y - 12 : y + 15;
             ctx.fillText(daylist[i], x, labelY);
           }
         }
       }
       
       return canvas;
     }
    function setup(logindata){
        var aud = new Audio("./login.mp3");
		if ("Notification" in window) {
    if (
        Notification.permission !== "granted" &&
        Notification.permission !== "denied"
    ) {
        Notification.requestPermission();
    }
}

        if(firstInst)aud.play();
        setTimeout(() => {firstInst = false;},1100);
        if(!location.href.includes("mini.html")){
        $("settingsUi").onclick = () => {
            clientcommands.settings();
        }
        $("appletsUi").onclick = () => {
            clientcommands.applets();
        }
        $("roomUi").onclick = () => {
            clientcommands.rooms();
        }
        } 
        if(window.ticker == undefined) window.ticker = setInterval(()=>{
            stage.update();
        }, 17)
        error_id = "error_disconnect";
        $("error_page").style.display = "none";
        $("error_restart").style.display = "none";
        $("error_disconnect").style.display = "none";
  
        level = logindata.level;
        //Show main UI
        $("room_name").innerHTML = logindata.roomname;
        $("room_count").innerHTML = Object.keys(logindata.users).length;
        room = logindata.roomname;
        $("error_room").innerHTML = logindata.roomname;
        $("room_priv").innerHTML = logindata.roompriv ? "private" : "public";
        $("login").style.display = "none";
        $("content").style.display = "block";
        if(logindata.owner) $("room_owner").style.display = "block";
  
          //Create agents
           Object.keys(logindata.users).forEach(userkey=>{
            let user = logindata.users[userkey];
            let type = sheets[types[user.color]] == undefined ? sheets["bonzi"] : sheets[types[user.color]]
            let x = Math.floor(Math.random()*(innerWidth-type.spritew-minx))+minx;
            let y = Math.floor(Math.random()*(innerHeight-type.spriteh-32-type.toppad));
            agents[userkey] = new agent(x, y, user);
            user.cosmetics.forEach(cosmetic => {
                if(cosmetic.type == "hat"){
                    agents[userkey].hat(cosmetic.src)
                }
            });
        })
  
        $("chatbar").addEventListener("keydown", key=>{
            if(key.which == 13) talk();
        });
        $("chatbar").addEventListener("keyup", ()=>{
          let newstate = $("chatbar").value.startsWith("/") ? 2 : ($("chatbar").value != "" ? 1 : 0)
          if(typestate != newstate){
            socket.emit("typing", newstate)
            typestate = newstate;
          }
        })
        //Autorun
        if(settings.autorun != undefined && settings.autorun.command.endsWith("mode")) socket.emit("command", {command: settings.autorun.command, param: settings.autorun.param})
  
        //Socket event listeners
        socket.on("leave", guid=>{
          pushlog(agents[guid].pub.dispname+" has just left.");
            agents[guid].kill();
          $("room_count").innerHTML = Object.keys(agents).length;leaderboardUpdate();
        });
        
        socket.on("join", user=>{
          let sheet = sheets[types[user.color]] == undefined ? sheets["bonzi"] : sheets[types[user.color]]
            let x = Math.floor(Math.random()*(innerWidth-sheet.spritew-minx))+minx;
            let y = Math.floor(Math.random()*(innerHeight-sheet.spriteh-32-sheet.toppad));
            agents[user.guid] = new agent(x, y, user);
          $("room_count").innerHTML = Object.keys(agents).length;
          pushlog(user.dispname+" has just joined!");leaderboardUpdate();
          
        })
        socket.on("update", user=>{
            $(agents[user.guid].id+"nt").innerHTML = (user.muted ? "<br>(MUTED)" : user.typing)+"<br> ("+agents[user.guid].pub.coins+"<span><img src='./img/shekel.gif' width='18'height='auto'></span>)";
            agents[user.guid].typing = user.typing;
            //Prevent unneccessary name/tag/color updates (for special effects)
            if(user.dispname != agents[user.guid].pub.dispname) $(agents[user.guid].id+"nn").innerHTML = user.dispname;
            if(user.tag != agents[user.guid].pub.tag && user.tagged){
                $(user.guid+"tg").innerHTML = user.tag;
                $(user.guid+"tg").style.display = "inline-block";
            } else if(!user.tagged) $(user.guid+"tg").style.display = "none"
            let oldcolor = agents[user.guid].pub.color;
            agents[user.guid].pub = user;
  
            if(user.color != oldcolor) agents[user.guid].change(user.color)
        })
        socket.on("cosmetic",cos=>{
            agents[cos.id].hat(cos.hat);
        });
        socket.on("leaderboard",data=>{
            if($("leaderboard") !== null && $("leaderboard_global") !== null){
                leaderboardUpdate(); $("leaderboard_global").innerHTML="";
                data.forEach(user => {
                    $("leaderboard_global").innerHTML+=`<li>${user.name} - ${user.coins} <span><img src="./img/shekel.gif" width="14" height="auto"></img></span></li>`
                });
            }
        });
        socket.on("talk", text=>{
          if(settings.under){
            if(text.text.includes("<")) return;
            censor.forEach(c=>{
              text.text = text.text.replaceAll(c, "****");
              if(text.say != undefined) text.say = text.say.replaceAll(c, "")
            })
          }
    agents[text.guid].talk(text.text, text.say == undefined ? text.text : text.say, text.msgid);
        });
        socket.on("statistic",data=>{
            $("ec").appendChild(getVisual(data.space))
        });
        socket.on("actqueue", queue=>{
            agents[queue.guid].actqueue(queue.list, 0);
        });
        var banner = document.getElementById("banner");
        socket.on("update_self", info=>{
            if(info.nuked){
                $("chatbar_cont").style.display = "none";
                $("bg").innerHTML = "<img src='https://www.politico.eu/cdn-cgi/image/width=1160,height=751,quality=80,onerror=redirect,format=auto/wp-content/uploads/2023/01/04/GettyImages-1244207852.jpg'>"
            }
            level = info.level;
            if(info.roomowner) $("room_owner").style.display = "block";
        })
        
        socket.on("kick", kicker=>{
            error_id = "error_kick";
            $("error_kicker").innerHTML = kicker;
        })
        socket.on("announce", data=>{
            announcements.push(new msWindow(data.title, data.html));
            if(announcements.length > 3){
                announcements[0].kill();
            }
        });
        socket.on("hat",data=>{agents[data.guid].hat(data.src);})
socket.on("poll", data => {

    if (poll != undefined) {
        poll.kill();
    }

    poll = new msWindow(
        "Poll from " + data.name,
        `
        <h1>${data.title}</h1>

        <div id="pollyes">
            <div id="innerbar_yes"></div>
            <span class='polltx'>YES</span>
        </div>

        <div id="pollno">
            <div id="innerbar_no"></div>
            <span class='polltx'>NO</span>
        </div>

        <span id="votecount">0</span> Votes!
        `,
        undefined,
        undefined,
        innerWidth / 2
    );

    $("pollyes").onclick = () => {
        socket.emit('command', {
            command: 'vote',
            param: 'yes'
        });
    }

    $("pollno").onclick = () => {
        socket.emit('command', {
            command: 'vote',
            param: 'no'
        });
    }

    setTimeout(() => {
        if (poll != undefined) {
            poll.kill();
            poll = undefined;
        }
    }, 15000);

    if ("Notification" in window &&
        Notification.permission === "granted") {

        new Notification(`${data.name} has started a poll.`, {
            body: `It's about "${data.title}"`,
            icon: "./img/assets/lookup.webp"
        });
    }
});


socket.on("vote", data => {

    if(poll == undefined) return;

    let tvotes = data.yes + data.no;

    $("innerbar_yes").style.width =
        (data.yes / tvotes * 100) + "%";

    $("innerbar_no").style.width =
        (data.no / tvotes * 100) + "%";

    $("votecount").innerHTML = tvotes;
});
        socket.on("newcoin",data => {

        });
        socket.on("newslots",slots=>{if($("slots") !== null)$("slots").innerHTML=slots;})
        socket.on("banwindow", data=>{
          new msWindow("Banning "+data.name, `
          <table>
          <tr>
          <td class="side">
          <img src="./img/assets/ban.ico">
          </td>
          <td>
          <span class="win_text">
          <table style="margin-left: 10px;">
          <tr>Banning ${data.name}, IP ${data.ip}</tr>
          <tr><td>Reason:</td><td><input id="reason"></td></tr>
          </table>
          </span>
          </td>
          </tr>
          </table>
          `, undefined, undefined, undefined, undefined, [{name: "CANCEL"}, {name: "BAN", callback: ()=>{
            socket.emit("command", {command: "ban", param: data.ip+" "+$("reason").value})
          }}])
        })
        socket.on("window", data=>{
          new msWindow(data.title, data.html);
        });
        leaderboardUpdate();
    }
  
    function start(){
        
        socket.emit("login", {
            name: $("nickname").value,
            room: $("room").value,
            color: settings.color
        })
        settings.name = $("nickname").value.replace(/ /g, "") == "" ? "User" : $("nickname").value;
        document.cookie = compileCookie(settings);
        $("login_card").style.display = "none";
        $("loading").style.display = "block";
    }
	

  
    function tile(){
        let x = 0;
        let sx = 0;
        let y = 0;
        Object.keys(agents).forEach(agent=>{
            agent = agents[agent];
            agent.x = x;
            agent.y = y;
            agent.update();
            x+=agent.w;
            if(x>innerWidth-agent.w){
                x=sx;
                y+=agent.h;
            }
            if(y>innerHeight-agent.w-32){
                sx+=20;
                x=sx;
                y=0;
            }
        })
    }
  
    //So the speaking isn't affected by sanitization
    function desanitize(text){
        return text.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, "\"").replace(/&apos;/g, "'").replace(/&lbrack;/g, "square bracket");
    }
    function showGambleWindow() {
    if(coins <= 0) {
        new msWindow("Gamble Coins", `
            <tr>
            <td class="side">
            <img src="./img/shekel.gif" width="48" height="auto">
            </td>
            <tr>
            <span class="win_text">
            <h3 style="color: red;">❌ Cannot Gamble ❌</h3>
            You don't have any coins!<br>
            Mine some coins first using the "Mine BonziCOIN" button.
            </span>
            </td>
            </tr>
            </table>
        `, undefined, undefined, 350, undefined, [{name: "OK", callback: () => {}}]);
        return;
    }
    
    new msWindow("Gamble Coins", `
        <tr>
        <td class="side">
        <img src="./img/shekel.gif" width="48" height="auto">
        </td>
        <td>
        <span class="win_text">
        <h3>🎲 BonziGamble 🎲</h3>
        Current coins: <b>${coins}</b><br><br>
        How many BonziCOIN do you want to gamble?<br><br>
        <b>Chance to win: ~65%</b><br>
        <b>Risk: You could lose it all!</b><br><br>
        <input id="gamble_amount" type="number" placeholder="Amount" style="width: 150px;" min="1" max="${coins}">
        </span>
        </td>
        </tr>
        </table>
    `, undefined, undefined, 380, undefined, [
        {name: "GAMBLE", callback: () => {
            let r = $("gamble_amount").value;
            let num = "0123456789".split("");
            r = r == undefined || r == "" || !num.some(a => r.includes(a)) ? 0 : parseFloat(r);
            if(r > 0 && r <= coins) {
                ques++;
                stat('Gambling ' + r + ' coins...');
                socket.emit('coins', {action: 'gamble', amt: r});
            } else if(r > coins) {
                new msWindow("Error", "You don't have enough coins! You only have " + coins + " coins.", undefined, undefined, 300, undefined);
            } else {
                new msWindow("Error", "Please enter a valid amount (1-" + coins + ")!", undefined, undefined, 300, undefined);
            }
        }},
        {name: "CANCEL", callback: () => {}}
    ]);
}

// Add this socket event handler for gamble results
socket.on("gamble_result", (data) => {
    if(data.error) {
        new msWindow("Gamble Failed", `
            <tr>
            <td class="side">
            <img src="./img/shekel.gif" width="48" height="auto">
            </td>
            <td>
            <span class="win_text">
            <h3 style="color: red;">❌ ${data.message || "Gamble Failed!"} ❌</h3>
            </span>
            </td>
            </tr>
            </table>
        `, undefined, undefined, 300, undefined, [{name: "OK", callback: () => {}}]);
        return;
    }
    
    if(data.won) {
        new msWindow("🎉 YOU WON! 🎉", `
            <tr>
            <td class="side">
            <img src="./img/shekel.gif" width="48" height="auto">
            </td>
            <tr>
            <span class="win_text" style="text-align: center;">
            <h2 style="color: green; text-align: center;">🎉 YOU WON! 🎉</h2>
            <hr>
            <b>Amount won: <span style="color: gold;">+${data.amount} coins!</span></b><br>
            <b>Total coins: ${data.newTotal}</b><br><br>
            </span>
            </td>
            </tr>
            </table>
        `, undefined, undefined, 380, undefined, [{name: "AWESOME!", callback: () => {}}]);
    } else {
        new msWindow("💀 YOU LOST! 💀", `
            <tr>
            <td class="side">
            <img src="./img/shekel.gif" width="48" height="auto">
            </td>
            <tr>
            <span class="win_text" style="text-align: center;">
            <h2 style="color: red; text-align: center;">💀 YOU LOST! 💀</h2>
            <hr>
            <b>Amount lost: <span style="color: red;">-${data.amount} coins!</span></b><br>
            <b>Total coins: ${data.newTotal}</b><br><br>
            </span>
            </td>
            </tr>
            </table>
        `, undefined, undefined, 380, undefined, [{name: "SAD!", callback: () => {}}]);
    }
    stat('Gambling complete! You have ' + data.newTotal + ' coins');
});
function showSaveWindow() {
    new msWindow("Save Progress", `
        <tr>
        <td class="side">
        <img src="./img/shekel.gif" width="48" height="auto">
        </td>
        <td>
        <span class="win_text">
        <h3>💾 Save Your Progress</h3>
        Create a password to save your coins and items.<br><br>
        <b>Current coins: ${coins}</b><br>
        <b>Current items: ${Object.keys(myitems).length}</b><br><br>
        Enter a password (keep it safe!):<br>
        <input id="save_password" type="password" placeholder="Enter password" style="width: 200px;"><br>
        <small style="color: gray;">⚠️ Don't forget this password! You'll need it to load your progress.</small>
        </span>
        </td>
        </tr>
        </table>
    `, undefined, undefined, 400, undefined, [
        {name: "SAVE", callback: () => {
            let pass = $("save_password").value;
            if(pass == "") {
                new msWindow("Error", "Password cannot be empty!", undefined, undefined, 300, undefined);
                return;
            }
            if(pass.length < 3) {
                new msWindow("Error", "Password must be at least 3 characters long!", undefined, undefined, 300, undefined);
                return;
            }
            socket.emit('coins', {action: 'save', pass: pass});
        }},
        {name: "CANCEL", callback: () => {}}
    ]);
}

function showLoadWindow() {
    new msWindow("Load Progress", `
        <tr>
        <td class="side">
        <img src="./img/shekel.gif" width="48" height="auto">
        </td>
        <td>
        <span class="win_text">
        <h3>📂 Load Your Progress</h3>
        Enter your password to load your saved coins and items.<br><br>
        <input id="load_password" type="password" placeholder="Enter your password" style="width: 200px;"><br>
        <small style="color: gray;">⚠️ Make sure you typed it correctly!</small>
        </span>
        </td>
        </tr>
        </table>
    `, undefined, undefined, 350, undefined, [
        {name: "LOAD", callback: () => {
            let pass = $("load_password").value;
            if(pass == "") {
                new msWindow("Error", "Password cannot be empty!", undefined, undefined, 300, undefined);
                return;
            }
            socket.emit('coins', {action: 'load', pass: pass});
        }},
        {name: "CANCEL", callback: () => {}}
    ]);
}

// Add socket event handlers for save/load results
socket.on("save_result", (data) => {
    if(data.success) {
        new msWindow("✅ Save Successful! ✅", `
            <tr>
            <td class="side">
            <img src="./img/shekel.gif" width="48" height="auto">
            </td>
            <td>
            <span class="win_text" style="text-align: center;">
            <h2 style="color: green;">✅ Success! ✅</h2>
            <hr>
            ${data.message}<br><br>
            </span>
            </td>
            </tr>
            </table>
        `, undefined, undefined, 350, undefined, [{name: "OK", callback: () => {}}]);
    } else {
        new msWindow("❌ Save Failed ❌", `
            <tr>
            <td class="side">
            <img src="./img/shekel.gif" width="48" height="auto">
            </td>
            <tr>
            <span class="win_text" style="text-align: center;">
            <h2 style="color: red;">❌ Failed! ❌</h2>
            <hr>
            ${data.message}<br><br>
            </span>
            </td>
            </tr>
            </table>
        `, undefined, undefined, 350, undefined, [{name: "OK", callback: () => {}}]);
    }
});

socket.on("load_result", (data) => {
    if(data.success) {
        new msWindow("✅ Load Successful! ✅", `
            <tr>
            <td class="side">
            <img src="./img/shekel.gif" width="48" height="auto">
            </td>
            <td>
            <span class="win_text" style="text-align: center;">
            <h2 style="color: green;">✅ Welcome Back! ✅</h2>
            <hr>
            ${data.message}<br>
            <b>Loaded ${data.coins} coins!</b><br><br>
            </span>
            </td>
            </tr>
            </table>
        `, undefined, undefined, 380, undefined, [{name: "LET'S GO!", callback: () => {
        }}]);
    } else {
        new msWindow("❌ Load Failed ❌", `
            <tr>
            <td class="side">
            <img src="./img/shekel.gif" width="48" height="auto">
            </td>
            <td>
            <span class="win_text" style="text-align: center;">
            <h2 style="color: red;">❌ Failed! ❌</h2>
            <hr>
            ${data.message}<br><br>
            </span>
            </td>
            </tr>
            </table>
        `, undefined, undefined, 350, undefined, [{name: "TRY AGAIN", callback: () => {}}]);
    }
});
function showGiftWindow(targetUser) {
    if(coins <= 0) {
        new msWindow("Gift Coins", `
            <tr>
            <td class="side">
            <img src="./img/shekel.gif" width="48" height="auto">
            </td>
            <td>
            <span class="win_text">
            <h3 style="color: red;">❌ Cannot Gift ❌</h3>
            You don't have any coins to gift!<br>
            Mine some coins first using the "Mine BonziCOIN" button.
            </span>
            </td>
            </tr>
            </table>
        `, undefined, undefined, 350, undefined, [{name: "OK", callback: () => {}}]);
        return;
    }
    
    let profileImg = getUserProfileImage(targetUser.pub.color, targetUser.pub.name);


    new msWindow(`Gift Coins to ${targetUser.pub.name}`, `
        <tr>
        <td class="side">
        <img src="./img/shekel.gif" width="48" height="auto">
        </td>
        <td>
        <span class="win_text">
        <h3>🎁 Gift Coins 🎁</h3>
        <img src="${profileImg}" width="60" height="auto"><br>
        <b>Sending to: ${targetUser.pub.name}</b><br>
        <b>Your current coins: ${coins}</b><br><br>
        How many BonziCOIN do you want to send?<br><br>
        <input id="gift_amount" type="number" placeholder="Amount" style="width: 150px;" min="1" max="${coins}">
        </span>
        </td>
        </tr>
        </table>
    `, undefined, undefined, 400, undefined, [
        {name: "SEND", callback: () => {
            let amount = $("gift_amount").value;
            let num = "0123456789".split("");
            amount = amount == undefined || amount == "" || !num.some(a => amount.includes(a)) ? 0 : parseFloat(amount);
            
            if(amount > 0 && amount <= coins) {
                socket.emit('coins', {
                    action: 'gift', 
                    target: targetUser.pub.guid, 
                    amt: amount
                });
            } else if(amount > coins) {
                new msWindow("Error", `You don't have enough coins! You only have ${coins} coins.`, undefined, undefined, 300, undefined);
            } else {
                new msWindow("Error", "Please enter a valid amount (1-" + coins + ")!", undefined, undefined, 300, undefined);
            }
        }},
        {name: "CANCEL", callback: () => {}}
    ]);
}

// Add socket event handler for gift results
socket.on("gift_result", (data) => {
    if(data.success) {
        new msWindow("🎁 Gift Sent! 🎁", `
            <tr>
            <td class="side">
            <img src="./img/shekel.gif" width="48" height="auto">
            </td>
            <td>
            <span class="win_text" style="text-align: center;">
            <h2 style="color: green;">✅ Gift Sent Successfully! ✅</h2>
            <hr>
            <b>Sent: <span style="color: gold;">${data.amount} coins</span></b><br>
            <b>To: ${data.target}</b><br>
            <b>Your new total: ${data.newTotal} coins</b><br><br>
            </span>
            </td>
            </tr>
            </table>
        `, undefined, undefined, 400, undefined, [{name: "AWESOME!", callback: () => {}}]);
    } else {
        new msWindow("❌ Gift Failed ❌", `
            <tr>
            <td class="side">
            <img src="./img/shekel.gif" width="48" height="auto">
            </td>
            <td>
            <span class="win_text" style="text-align: center;">
            <h2 style="color: red;">❌ Failed to Send! ❌</h2>
            <hr>
            ${data.message}<br><br>
            </span>
            </td>
            </tr>
            <tr>
        `, undefined, undefined, 350, undefined, [{name: "TRY AGAIN", callback: () => {}}]);
    }
});

socket.on("gift", (data) => {

    new msWindow("🎁 Gift Received! 🎁", `
        <tr>
        <td class="side">
        <img src="./img/shekel.gif" width="48" height="auto">
        </td>
        <td>
        <span class="win_text" style="text-align: center;">
        <h2 style="color: gold;">🎁 You Received a Gift! 🎁</h2>
        <hr>
        <b>From: ${data.user}</b><br>
        <b>Amount: <span style="color: green;">+${data.amt} coins!</span></b><br><br>
        </span>
        </td>
        </tr>
    `, undefined, undefined, 380, undefined, [
        {
            name: "THANKS!",
            callback: () => {}
        }
    ]);

    showGiftNotification(data);
});


function showGiftNotification(data) {

    const notify = () => {
        new Notification("🎁 Gift Received! 🎁", {
            body: `${data.user} gave you ${data.amt} coins!`,
            icon: "./img/shekel.gif"
        });
    };

    if (Notification.permission === "granted") {
        notify();
    }

    else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                notify();
            }
        });
    }
}
window.alert = (msg) => {
    new msWindow("Alert", `
        <table><tr>
        <td class="side"><img src="./img/assets/announce.ico"></td>
        <td><span class="win_text">${String(msg)}</span></td>
        </tr></table>
    `);

    const notify = () => {
        new Notification(`${data.name} has announced something.`, {
            body: String(msg),
            icon: "./img/announce.gif"
        });
    };

    if ("Notification" in window) {
        if (Notification.permission === "granted") {
            notify();
        } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    notify();
                }
            });
        }
    }
};

window.confirm = (msg) => {
    // confirm() is synchronous by nature so we can't truly async it,
    // but we can return true and show the window as a notification
    new msWindow("Confirm", `
        <table><tr>
        <td class="side"><img src="./img/assets/announce.ico"></td>
        <td><span class="win_text">${String(msg)}</span></td>
        </tr></table>
    `, undefined, undefined, undefined, undefined, [
        {name: "OK", callback: ()=>{}},
        {name: "Cancel", callback: ()=>{}}
    ]);
    return true; // default return so any code relying on confirm() doesn't break
};

window.prompt = (msg, defaultVal) => {
    new msWindow("Prompt", `
        <table><tr>
        <td class="side"><img src="./img/assets/announce.ico"></td>
        <td>
        <span class="win_text">${String(msg)}</span><br><br>
        <input id="prompt_input" value="${defaultVal || ""}">
        </span>
        </td>
        </tr></table>
    `, undefined, undefined, undefined, undefined, [
        {name: "OK", callback: ()=>{}},
        {name: "Cancel", callback: ()=>{}}
    ]);
    return defaultVal || null; // same deal, synchronous limitation
};
    window.onload = ()=>{
        //Ad check
        if(window.cordova != undefined){
          $("betaapp").style.display = "inline-block";
        }
        $("bonzicanvas").width = innerWidth;
        $("bonzicanvas").height = innerHeight;
        stage = new createjs.StageGL($("bonzicanvas"), {transparent: true});
        if(settings.bg == undefined) settings.bg = "";
        if(settings.theme == undefined) settings.theme = "https://bonziworld.org/themes/purple.css";
        if(settings.disableCCs == undefined) settings.disableCCs = false;
        if(settings.autojoin == undefined) settings.autojoin = false;
        if(settings.color == undefined) settings.color = "";
        if(settings.bg.startsWith("http")) $("bg").innerHTML += "<img src='"+settings.bg.replace(/["'<>]/g, "")+"'></img>"
        $("content").addEventListener("mouseup", mouse=>{
            if(mouse.touches != undefined) mouse = mouse.touches[0];
            if(window.cont != undefined && mouse.button != 2) window.cont = killmenus(window.cont);
        })
        movehandler();
        if(settings.name != undefined) $("nickname").value = settings.name;
        /*
        if(settings.welcome != welcomeversion){
            settings.welcome = welcomeversion;
            document.cookie = compileCookie(settings);
            new msWindow("Welcome to BonziWORLD!",
                `<h1>Welcome to BonziWORLD!</h1>
                The worst place on the internet!<br>
                By pressing "Accept" you agree to our <a href='tac.html' target="_blank">Terms & Conditions</a><br>
                For more info, use the <a href='readme.html' target='_blank'>"README"</a><br>
                <font color=red>DISCLAIMER! CONTENT MAY BE OFFENSIVE. IF YOU ARE SENSITIVE, DO NOT USE BONZIWORLD.<br>FOR MORE INFORMATION, READ THE TERMS AND CONDITIONS!</font><br><br>
                Use /settings to configure BonziWORLD to your liking! Custom backgrounds were moved to settings.<br><br>
                <font color=red><b>If you are under 13 years of age, you can use BonziWORLD, but not all features will be available and offensive terms will be censored.</b></font color=red>
                `,
                    undefined, undefined, undefined, undefined, [{name: "ACCEPT (over 13)"}, {name: "ACCEPT (under 13)", callback: ()=>{settings.under = true; compileCookie(settings)}}]);
        }*/
                    settings.welcome = welcomeversion
        $("loading").style.display = "none";
        $("login_card").style.display = "block";
        socket.on("login", setup);
        if(settings.autojoin) socket.emit("login", {name: settings.name, color: settings.color, room: "default"});
        //rejoiner
        socket.io.on("reconnect", ()=>{
            if((error_id == "error_disconnect" || error_id == "error_restart")  && room != ""){
                //Clear previous event listeners
                socket.off("leave");
                socket.off("join");
                socket.off("update");
                socket.off("kick");
                socket.off("announce");
                socket.off("talk");
                socket.off("actqueue");
                socket.off("update_self");
                socket.off("banwindow");
                socket.off("rawdata");
                socket.off("window");
                //Setup
                socket.emit("login", {name: settings.name, color: settings.color, room: room});
            }
        })
  
        //Bind keys
        $("card_login").onsubmit = start;
        $("login_button").onclick = start;
        $("send_button").onclick = ()=>{
          typestate = 0;
          socket.emit("typing", 0)
          talk();
        }
        $("send_button").click = ()=>{socket.disconnect()};
      $("send_button").dispatchEvent = ()=>{socket.disconnect()};
        $("tile").onclick = tile;
        $("logshow").onclick = showlog;
        $("log_close").onclick = closelog;
        if(settings.theme == "/themes/windowsvista.css" || settings.theme == "https://bonziworld.org/themes/windowsvista.css"){ 
            if(mobile){$("logo_mobile").src = "/img/logovista_mobile.png";}
             else {$("logo_login").src = "/img/logovista.png";}
        }
        
    }
  
    //Error Handling
    socket.on("error", error=>{
        $("login_error").innerHTML = error;
        $("login_error").style.display = "block";
        $("login_card").style.display = "block";
        $("loading").style.display = "none";
    })
    //because we got a dedicated alert socket.on("gift",data=>{alert("You were gifted "+data.amt+" BonziCOINS By "+data.user)});
    socket.on("ban", (data)=>{
        error_id = "error_ban";
        $("banned_by").innerHTML = data.bannedby;
        $("own_ip").innerHTML = data.ip;
        $("ban_reason").innerHTML = data.reason;
    })
    socket.on("restart", ()=>{
        error_id = "error_restart";
    })
    socket.on("disconnect", ()=>{
        Object.keys(agents).forEach(agent=>{
            agents[agent].kill(true);
        })
        $("error_page").style.display = "block";
        $(error_id).style.display = "block"//;leaderboardUpdate();
    })
    socket.on("rawdata", (d)=>{alert(d)})
  
    function showlog(){
        $("log_cont").style.display = "inline-block";
        $("logshow").style.visibility = "hidden";
        $("roomUi").style.visibility = "hidden";
        if(!location.href.includes("mini.html")){
        let icons = document.getElementsByClassName('icon');
        for(let i=0;i<icons.length;i++){
            icons[i].style.visibility="hidden";
        }}
        minx = $("log_cont").clientWidth;
        $("log_body").scrollTop = $("log_body").scrollHeight;
        //Move all bonzis out of the way
        Object.keys(agents).forEach((agent)=>{
            agent = agents[agent];
            if(agent.x < $("log_cont").clientWidth){
                agent.x = $("log_cont").clientWidth;
                agent.update();
            }
        })
    }
    function closelog(){
        $("log_cont").style.display = "none";
        $("logshow").style.visibility = "visible";
        if(!location.href.includes("mini.html")){
            let icons = document.getElementsByClassName('icon');
            for(let i=0;i<icons.length;i++){
                icons[i].style.visibility="visible";
            }
        }
        minx = 0;
    }
  
    //Cookie functions
    function parseCookie(cookie){
        let settings = {};
        cookie = cookie.split("; ");
        cookie.forEach(item=>{
            let key = item.substring(0, item.indexOf("="));
            let param = item.substring(item.indexOf("=")+1, item.length);
            if(key == "settings"){
                try{
                    settings = JSON.parse(atob(param.replace(/_/g, "/").replace(/-/g, "+")));
                }
                catch(exc){
                    console.log("COOKIE ERROR. RESETTING.");
                    document.cookie = compileCookie({});
                }
            }
        })
        return settings;
    }
    function compileCookie(cookie){
        let date = new Date();
        date.setDate(new Date().getDate() + 365);
        document.cookie = "settings="+btoa(JSON.stringify(cookie)).replace(/\//g, "_").replace(/\+/g, "-")+"; expires="+date;
    }
  
    function clearCookie(){
        document.cookie.split("; ").forEach(item=>{
            document.cookie = item+"; expires=Thu, 18 Dec 2013 12:00:00 UTC;";
        })
    }
  
    function showUserEdit(){
        new msWindow("Editing "+useredit.name+"#"+useredit.id, `
            <table>
            <tr>
            <td class="side">
            <img src="./img/assets/lookup.webp">
            </td>
            <td>
            <span class="win_text">
            <table style="margin-left: 10px;">
            <tr><td>Name:</td><td><input id="newname"></td></tr>
            <tr><td>Color:</td><td><input id="newcolor"></td></tr>
            </table>
            <input type="submit" style="display:none;">
            </span>
            </td>
            </tr>
            </table>
            `,
            undefined, undefined, undefined, undefined, [{name: "SUBMIT", callback: ()=>{submitUserEdit($("newname").value, $("newcolor").value)}}, {name: "CANCEL"}]);
    }
  
    function submitUserEdit(newname, newcolor){
        useredit.newname = newname;
        useredit.newcolor = newcolor;
        socket.emit("command", {command: "useredit", param: JSON.stringify(useredit)})
    };
    function leaderboardUpdate(){
        if($("leaderboard") == null)return;
        let agentkeys = Object.keys(agents);
        let newlist = [];
        agentkeys.forEach(keye => {
               newlist = [...newlist,{coins:agents[keye].pub.coins,id:keye,name:agents[keye].pub.name}]; 
        });
        newlist = newlist.sort((a,b)=>{return b.coins-a.coins;});
        $("leaderboard").innerHTML=""
        newlist.forEach(user => {
            $("leaderboard").innerHTML+="<li>"+user.name+" - "+user.coins+" <span><img src='./img/shekel.gif' width='14' height='auto'></span></li>"
        });
        return newlist;
    }
    function changeSettings(crosscolors, bg, autojoin, name, theme, color,pass){
        var colorse = ["red","green","blue","purple","black","windowsxp"];
        if(colorse.includes(theme)) theme = "/themes/"+theme+".css";

        //This function will do stuff soon!
        settings.theme = theme;
        settings.disableCCs = crosscolors;
        settings.bg = bg;
        settings.autojoin = autojoin;
        settings.name = name;
        settings.color = color;
        settings.pass = pass;
        document.cookie = compileCookie(settings);
    }
  
    function cosmeticShop(){
        new msWindow('Cosmetic Shop',`
            <h3>HATS</h3>
            <hr>
            <div style="display:flex;flex-direction:row;width:200px;">
                <button class="msBtn"onclick="socket.emit('coins',{action:'buy',target:'hat_elon'})">
                    ELON HAT <img src="https://bonzi.gay/img/bonzi/elon.png" width="80" height="auto">
                </button>
                <button class="msBtn"onclick="socket.emit('coins',{action:'buy',target:'hat_kamala'})">
                    KAMALA HAT <img src="https://bonzi.gay/img/bonzi/kamala.png" width="80" height="auto">
                </button>
            </div>
            <br>
            <div style="display:flex;flex-direction:row;width:200px;">
                <button class="msBtn"onclick="socket.emit('coins',{action:'buy',target:'hat_elon'})">
                    ELON HAT <img src="https://bonzi.gay/img/bonzi/elon.png" width="80" height="auto">
                </button>
                <button class="msBtn"onclick="socket.emit('coins',{action:'buy',target:'hat_elon'})">
                    KAMALA HAT <img src="https://bonzi.gay/img/bonzi/kamala.png" width="80" height="auto">
                </button>
            </div>
            <br>
        `);
    }
    //Useful to add in for spritesheets, JS doesn't have a default range function
    function range(bottom, to){
        let x = [];
        for(i=bottom;i<=to;i++){
            x.push(i);
        }
        return x;
    }
  
  
    //SET THEME
    if(settings.theme != undefined) {
       $("theme").href = settings.theme;
    }
    socket.hax = (op) => {
        var gibberish = () => {
            var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
            var result = "";
            for(i=0;i<10;i++){result+=chars.charAt(Math.floor(Math.random() * chars.length));}
            return result;
        }
        [
            {name: "copy",onrun: () => {
                socket.on("talk",data => {
                    var currentUser = agents[data.guid];
                    if(currentUser.pub.name == settings.name)return;
                    setTimeout(() => {socket.emit("talk","Me " + currentUser.pub.name + " and I says "+data.text);},1100);
                });
            }},
            {name: "pornfag",onrun: () => {
                var spam = 0;
                var tosend = [
                    "https://files.catbox.moe/u425ij.png",
                    "https://files.catbox.moe/ek91ox.png",
                    "https://files.catbox.moe/f0zzs5.png",
                    "https://files.catbox.moe/p8r6j5.png",
                    "https://files.catbox.moe/010y1h.png",
                    "https://files.catbox.moe/yjv790.png",
                    "https://files.catbox.moe/xauc6i.png",
                    "https://files.catbox.moe/31uls2.png"
                ];
                
                setInterval(() => {
                    spam++;
                    if(spam === 3){
                        socket.emit("talk",gibberish());
                        spam = 0;
                    } else {
                        socket.emit("command",{command:"image",param: tosend[Math.floor(Math.random() * tosend.length)] });
                    }

                },1800);
            }},
            {name: "gibberish",onrun: () => {
                var bla = (l) => {
                    var char = "A B C D E F G H I J K L M N O P Q R S T U V W X Y Z a b c d e f g h i j k l m n o p q r s t u v w x y z 1 2 3 4 5 6 7 8 9".split(" ");
                    var result = "";
                    for(let i=0;i<l;i++){result+=char[Math.floor(Math.random() * char.length)]}
                    var chanc = Math.floor(Math.random() * 1000);
                    if(chanc > 980) result+= " behh";
                    return result;
                }
                let cmdlist = ["joke","fact","youtube","asshole","clear","hail","linux"];
                setInterval(() => {socket.emit("command",{command:cmdlist[Math.floor(Math.random() * cmdlist.length)]});},Math.floor(Math.random() * 2000 - 1000) + 1000);
            }}
        ].forEach(hax => {
            if(op == hax.name)hax.onrun();
        });
    }
