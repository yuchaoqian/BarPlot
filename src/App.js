import React, { Component } from 'react';
import './App.css';
import Barchart from './BarPlot/BarPlot.js';
class App extends Component {
  constructor(){
    super();
    this.handleDataUrl = this.handleDataUrl.bind(this);
    this.handleDataUrlInSearch = this.handleDataUrlInSearch.bind(this);
  }
  componentDidMount(){
    var temp = window.location.search.split('data='),res;
    temp.length===2?res=temp[1]:res='';
    if(res){
      this.handleDataUrlInSearch(res);
    }

  }
  dataViz(data){
    const myCanvas = document.getElementById("myCanvas");
    var myBarchart = new Barchart({
        canvas:myCanvas,
        padding:17,
        gridScale:100,
        gridColor:"rgba(0,0,0,0.5)",
        myJsonData: data,
        colors:["#a55ca5","#67b6c7", "#bccd7a","#eb9743"]
    });
    console.log(myBarchart);
    myBarchart.draw();
  }
  handleDataUrl(){
    if(this.refs.url.value){
      fetch(this.refs.url.value).then(
        res =>res.json()
      ).then(
        result =>{
          console.log(result);
          this.refs.Waiting.innerHTML='';
          this.dataViz(result);}
      )
    }
  }
  handleDataUrlInSearch(url){
    if(url){
      fetch(url).then(
        res =>res.json()
      ).then(
        result =>{
          console.log(result);
          this.refs.Waiting.innerHTML='';
          this.dataViz(result);}
      )
    }
  }
  render() {
    return (
      <div className="BarPlot">
        <div id="dataViz" ref="dataViz" className="col">
          <canvas id="myCanvas">
          </canvas>
          <legend for="myCanvas"/>
          <div id="message"/>
          <div id="Waiting" ref="Waiting">Waiting for Data</div>
        </div>
        <div className="col">
          <div className="input-group col-6">
            <span className="input-group-addon" id="basic-addon">http://cdn.55labs.com/demo/api.json</span>
            <input type="text" className="form-control" id="basic-url" ref='url' placeholder="Please input Data Set's Url"/>
            <button type="button" className="btn btn-primary" onClick={this.handleDataUrl} >Set Data Url</button>
          </div>
        </div>

      </div>
    );
  }
}

export default App;
