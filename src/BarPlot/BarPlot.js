export default function Barchart(options){
  var options = options;
  var canvas = options.canvas;
  var ctx = canvas.getContext("2d");
  var colors = options.colors;
  canvas.width = 900;
  canvas.height = 400;
  var bars = [];
  function drawLine(ctx, startX, startY, endX, endY,color){
      ctx.save();
      ctx.strokeStyle = color;
      ctx.beginPath();
      ctx.moveTo(startX,startY);
      ctx.lineTo(endX,endY);
      ctx.stroke();
      ctx.restore();
  }
  function drawBar(ctx, upperLeftCornerX, upperLeftCornerY, width, height,color){
      ctx.save();
      ctx.fillStyle=color;
      ctx.fillRect(upperLeftCornerX,upperLeftCornerY,width,height);
      ctx.restore();
  }
  function getMousePos(evt) {
    var rect = options.canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
  }
  function draw(){
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      var legend = document.querySelector("legend[for='myCanvas']");
      legend.innerHTML='';
      var maxValue = 0;
      for (var categ in options.myJsonData.data.DAILY.dataByMember.players){
          //maxValue = Math.max(maxValue,options.myJsonData[categ]);
          var max = options.myJsonData.data.DAILY.dataByMember.players[categ].points.reduce(function(a, b) {
              return Math.max(a, b);
          });
          maxValue =  Math.max(max, maxValue);
      }
      var canvasActualHeight = canvas.height - options.padding * 2-100;
      var canvasActualWidth = canvas.width - options.padding * 2;

      //drawing the grid lines
      var gridValue = 0;
      while (gridValue <= maxValue){
          var gridY = canvasActualHeight * (1 - gridValue/maxValue) + options.padding;
          drawLine(
              ctx,
              0,
              gridY,
              canvas.width,
              gridY,
              options.gridColor
          );

          //writing grid markers
          ctx.save();
          ctx.fillStyle = options.gridColor;
          ctx.textBaseline="bottom";
          ctx.textAlign="center";
          ctx.font = "bold 10px Arial";
          ctx.fillText(gridValue, 10,gridY - 2);
          ctx.restore();

          gridValue+=options.gridScale;
      }

      //drawing the bars
      var barIndex = 0;
      var numberOfSubBars = Object.keys(options.myJsonData.data.DAILY.dataByMember.players).length;
      var numberOfGrandBars = options.myJsonData.data.DAILY.dates.length;
      var numberOfBars = numberOfSubBars*numberOfGrandBars;
      var barSize = (canvasActualWidth-(numberOfGrandBars)*options.padding)/numberOfBars;


      for (categ in options.myJsonData.data.DAILY.dataByMember.players){
          var val = options.myJsonData.data.DAILY.dataByMember.players[categ].points;
          for(var i=0;i<val.length;i++){
            var value = val[i]?val[i]:0;
            var barHeight = Math.round( canvasActualHeight * value/maxValue) ;
            var upperX = (i+2)* options.padding + (i*numberOfSubBars+barIndex) * barSize;
            var upperY = canvasActualHeight - barHeight + options.padding;
            drawBar(
                ctx,
                upperX,
                upperY,
                barSize,
                barHeight,
                colors[barIndex%colors.length]
            );
            bars.push({x:upperX,y:upperY,wd:barSize,hd:barHeight});
            var ft = value.toString();
            ctx.save();
            ctx.textBaseline="bottom";
            ctx.font = "bold 10px Arial";
            ctx.fillText(ft,upperX+(barSize-ft.length*10)/2,upperY);
            ctx.restore();
          }

          barIndex++;
      }
      console.log(bars);
      //drawing tag name
      for(var i = 0;i<options.myJsonData.data.DAILY.dates.length;i++){
        ctx.save();
        ctx.textBaseline="bottom";
        ctx.translate(options.padding*(i+2)+(i+1)*numberOfSubBars*barSize,canvasActualHeight+ options.padding*2);
        ctx.rotate(-Math.PI / 3);
        ctx.textAlign="right";
        ctx.fillStyle = "#000000";
        ctx.font = "bold 14px Arial";
        var tx = options.myJsonData.data.DAILY.dates[i]?options.myJsonData.data.DAILY.dates[i]:'';
        ctx.fillText(tx,0,0);
        ctx.restore();
      }
      //drawing series name
      ctx.save();
      ctx.textBaseline="bottom";
      ctx.textAlign="center";
      ctx.fillStyle = "#000000";
      ctx.font = "bold 14px Arial";
      ctx.fillText(options.myJsonData.settings.label, canvas.width/2,canvas.height);
      ctx.restore();

      //draw legend
      barIndex = 0;
      var divs = document.createElement("div");
      divs.className = "row"
      legend.append(divs);
      for (categ in options.myJsonData.settings.dictionary){
          var div = document.createElement("div");
          div.style.listStyle = "none";
          div.style.fontSize = '12px';
          div.style.borderLeft = "20px solid "+colors[barIndex%colors.length];
          div.style.padding = "5px";
          div.textContent = options.myJsonData.settings.dictionary[categ].firstname+' '+options.myJsonData.settings.dictionary[categ].lastname;
          div.className = "col-2"
          divs.append(div);
          barIndex++;
      }


      canvas.addEventListener('click', function(evt) {
        var mousePos = getMousePos(evt);
        var num = Math.floor((mousePos.x-options.padding*2)/(barSize*numberOfSubBars+options.padding));
        var subNum = Math.floor((mousePos.x-options.padding*2-(num)*(barSize*numberOfSubBars+options.padding))/barSize);
        subNum = subNum<=(numberOfSubBars-1)?subNum:null;
        var selectedBar = num>=0&&subNum!=null?bars[num+numberOfGrandBars*subNum]:null;
        console.log(selectedBar);
        if(selectedBar){
          ctx.save();
          ctx.beginPath();
          ctx.rect(selectedBar.x, selectedBar.y, selectedBar.wd, selectedBar.hd);
          if(ctx.isPointInPath(mousePos.x, mousePos.y)){
            var ins = Object.keys(options.myJsonData.data.DAILY.dataByMember.players)[subNum];
            var sum = options.myJsonData.data.DAILY.dataByMember.players[ins].points.reduce(function(accumulator, currentValue) {
                return accumulator + currentValue;
            });
            document.getElementById("message").innerHTML = "Sum: "+sum;
            document.getElementById("message").style.display = 'block';
            document.getElementById("message").style.left = selectedBar.x+barSize*numberOfSubBars+"px";
            document.getElementById("message").style.top = mousePos.y+"px";
          }
          ctx.restore();
        }else{
          document.getElementById("message").innerHTML = '';
          document.getElementById("message").style.display = 'none';
        }
      }, false);
  }
  return {draw : draw};
}
