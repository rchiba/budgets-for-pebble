/**
 * Welcome to Pebble.js!
 *
 * This is where you write your app.
 */

var UI = require('ui');
var Vector2 = require('vector2');

// Show splash screen while waiting for data
var splashWindow = new UI.Window();
var dollars = 0;
var cents = 0;
var dollarElement;
var centElement;
var selectionState = 0;
var transactionTypes = ['Food', 'Transportation', 'Fun'];

function main(){
  renderSplashWindow();
  splashWindow.show();
}

function renderSplashWindow(){
  
  if(!dollarElement){
  
    // instantiate elements
    
    var title = new UI.Text({
      position: new Vector2(0, 0),
      size: new Vector2(144, 168),
      text:'Track Expense',
      font:'GOTHIC_18_BOLD',
      color:'black',
      textOverflow:'wrap',
      textAlign:'center',
      backgroundColor:'white'
    });
    
    dollarElement = new UI.Text({
      position: new Vector2(5, 50),
      size: new Vector2(85, 55),
      font:'BITHAM_42_BOLD',
      textOverflow:'wrap',
      textAlign:'left',
    });
    
    centElement = new UI.Text({
      position: new Vector2(75, 50),
      size: new Vector2(70, 55),
      font:'BITHAM_42_BOLD',
      textOverflow:'wrap',
      textAlign:'left',
    });
    
    // Add to splashWindow and show
    splashWindow.add(title);
    splashWindow.add(dollarElement);
    splashWindow.add(centElement);
  }
  
  var dollarColor, dollarBG, dollarText, centColor, centBG, centText;
  if(selectionState === 0){
    // selecting dollars
    dollarColor = 'white';
    dollarBG = 'black';
    centColor = 'black';
    centBG = 'white';
  } else{
    // selecting cents
    dollarColor = 'black';
    dollarBG = 'white';
    centColor = 'white';
    centBG = 'black';
  }
  
  if(dollars < 10){
    dollarText = '$ ' + dollars;
  } else{
    dollarText = '$' + dollars;
  }
  
  if(cents < 10){
    centText = '.0' + cents;
  } else{
    centText = '.' + cents;
  }
  
  dollarElement.text(dollarText).color(dollarColor).backgroundColor(dollarBG);
  centElement.text(centText).color(centColor).backgroundColor(centBG);
  
}

function renderTransactionTypeMenu(){
  
  var items = [];
  for(var i = 0; i < transactionTypes.length; i++){
    items.push({title: transactionTypes[i]});
  }
  
  var menu = new UI.Menu({
    sections: [{
      items: items
    }]
  });
  menu.on('select', function(e) {
    console.log('Selected item #' + e.itemIndex + ' of section #' + e.sectionIndex);
    console.log('The item is titled "' + e.item.title + '"');
    var money = dollars * 100 + cents;
    trackExpense(money, e.item.title);
    menu.hide();
  });
  menu.show();
}

splashWindow.on('longClick', 'select', function(e) {
  var menu = new UI.Menu({
    sections: [{
      items: [{
        title: 'Track Expense'
      }, {
        title: 'Budget Summary'
      },{
        title: 'Budget Graphs'
      }]
    }]
  });
  menu.on('select', function(e) {
    if(e.item.title === 'Track Expense'){
      renderSplashWindow();
    } else if(e.item.title === 'Budget Summary'){
      renderSummaryMenu();
    } else if(e.item.title === 'Budget Graphs'){
      
    }
  });
  menu.show();
});

splashWindow.on('click', 'back', function(e){
  if(selectionState !== 0){
    selectionState--;
    renderSplashWindow();
  } else{
    splashWindow.hide();
  }
});

splashWindow.on('click', 'select', function(e){
  if(selectionState === 1){
    splashWindow.hide();
    renderTransactionTypeMenu();
  } else{
    selectionState++;
    renderSplashWindow();
  }
});

splashWindow.on('click', 'up', function(e) {
  if(selectionState === 0){
    dollars++;
  } else{
    cents++;
  }
  renderSplashWindow();
});

splashWindow.on('click', 'down', function(e) {
  if(selectionState === 0){
    if(dollars > 0){
      dollars--;
    }
  } else{
    if(cents > 0){
      cents--;
    }
  }
  renderSplashWindow();
});

function trackExpense(money, type){
  var transaction = {
    money: money,
    type: type,
    timestamp: new Date().getTime()
  };
  
  var transactions = localStorage.getItem(type);
  if(!transactions){
    transactions = [];
  }
  transactions.push(transaction);
  localStorage.setItem(type, transactions);
  
  var successCard = new UI.Card({
    title: 'Expense Tracked!',
    banner: 'images/check.png'
  });
  successCard.show();
  setTimeout(function(){
    successCard.hide();
  }, 1000);
}

function renderSummaryMenu(){
  // var months = [];
  // for(var i = 0; i < transactionTypes.length; i++){
  //   months.push({title: transactionTypes[i]});
  // }
  
  // var menu = new UI.Menu({
  //   sections: [{
  //     items: months
  //   }]
  // });
  // menu.on('select', function(e) {
  //   renderSummary(e.item.title);
  //   menu.hide();
  // });
  // menu.show();
}

function renderSummary(month){
  
}

main();