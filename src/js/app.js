/**
 * Welcome to Pebble.js!
 *
 * This is where you write your app.
 */

var UI = require('ui');
var Vector2 = require('vector2');
var Vibe = require('ui/vibe');
var Settings = require('settings');
_ = require('lib/underscore.js');

// Show splash screen while waiting for data
var splashWindow = new UI.Window();
var dollars = 0;
var cents = 0;
var dollarElement;
var centElement;
var selectionState = 0;
var transactionTypes = ['Food', 'Transit', 'Fun'];
var monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

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
    var money = dollars * 100 + cents;
    trackExpense(money, e.item.title);
    menu.hide();
  });
  menu.show();
}

splashWindow.on('longClick', 'select', function(e) {
  renderAppMainMenu(e);
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
    renderTransactionTypeMenu();
  } else{
    selectionState++;
    renderSplashWindow();
  }
});

splashWindow.on('click', 'up', function(e) {

  if(typeof fastInterval !== 'undefined'){
    clearInterval(fastInterval);
    fastInterval = undefined;
  } else{
    if(selectionState === 0){
      dollars++;
    } else{
      cents++;
    }
  }
  renderSplashWindow();
});

splashWindow.on('click', 'down', function(e) {
  if(typeof fastInterval !== 'undefined'){
    clearInterval(fastInterval);
    fastInterval = undefined;
  } else{
    if(selectionState === 0){
      if(dollars > 0){
        dollars--;
      }
    } else{
      if(cents > 0){
        cents--;
      }
    }
  }
  renderSplashWindow();
});

splashWindow.on('longClick', 'up', function(e){
  fastInterval = setInterval(function(){
    if(selectionState === 0){
      dollars++;
    } else{
      cents++;
    }
    renderSplashWindow();
  },50);
});

splashWindow.on('longClick', 'down', function(e){
  fastInterval = setInterval(function(){
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
  },50);
});

function setItem(key, value){
  localStorage.setItem(key, JSON.stringify(value));
}

function getItem(key){
  return JSON.parse(localStorage.getItem(key));
}

function trackExpense(money, type){
  var expense = {
    money: money,
    type: type,
    timestamp: new Date().getTime()
  };
  
  var expenses = getItem('expenses');
  if(!expenses){
    expenses = [];
  }
  expenses.push(expense);
  setItem('expenses', expenses );
  
  var successCard = new UI.Card({
    title: 'Expense Tracked!',
    banner: 'images/check.png'
  });
  successCard.show();
  Vibe.vibrate('short');
  setTimeout(function(){
    successCard.hide();
  }, 1000);
}

function renderAppMainMenu(e){
  var menu = new UI.Menu({
    sections: [{
      items: [{
        title: 'Track Expense'
      }, {
        title: 'Expenses'
      },{
        title: 'Budgets'
      }]
    }]
  });
  menu.on('select', function(e) {
    if(e.item.title === 'Track Expense'){
      renderSplashWindow();
    } else if(e.item.title === 'Expenses'){
      renderExpensesSummaryMenu();
    } else if(e.item.title === 'Budgets'){
      
    }
  });
  menu.show();
}

function renderExpensesSummaryMenu(){
  var months = [];
  
  var expenses = getItem('expenses');
  _.each(expenses, function(expense){
    months.push( monthNames[new Date(expense.timestamp).getMonth()] );
  });
  months = _.uniq(months);
  months = _.map(months, function(month){
    return {
      title: month
    };
  });


  var menu = new UI.Menu({
    sections: [{
      items: months
    }]
  });
  menu.on('select', function(e) {
    renderExpensesMonthSummaryMenu(e.item.title);
  });
  menu.show();
}

function formatMoney(cents){
  if(typeof Number.formatMoney === 'undefined'){
    Number.prototype.formatMoney = function(c, d, t){
    var n = this, 
        c = isNaN(c = Math.abs(c)) ? 2 : c,
        d = d == undefined ? "." : d,
        t = t == undefined ? "," : t,
        s = n < 0 ? "-" : "",
        i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "",
        j = (j = i.length) > 3 ? j % 3 : 0;
       return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
    };
  }
  return '$'+(cents/100).formatMoney(2);
}

function formatDate(date) {

  var month = monthNames[date.getMonth()];
  var day = date.getDate();

  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0'+minutes : minutes;
  var strTime = hours + ':' + minutes + ' ' + ampm;
  return month.substr(0,3) + ' ' + day + ', ' + strTime;
}

function renderExpensesMonthSummaryMenu(month){
  var expenses = getItem('expenses');
  var menuItems = [];

  var totalExpenses = _.reduce(_.map(expenses, function(expense){ return expense.money; }), function(memo, num){ return memo + num; });
  menuItems.push({title: 'Total: ' + formatMoney(totalExpenses)});

  var types = _.uniq(_.map(expenses, function(expense){
    return expense.type;
  }));
  _.each(types, function(type){
    var typeExpenses = _.map(_.where(expenses, {type: type}), function(expense){ return expense.money; });
    var typeExpenseTotal = _.reduce(typeExpenses, function(memo, num){ return memo + num; });
    menuItems.push({title: type+': '+formatMoney(typeExpenseTotal) });
  });

  var menu = new UI.Menu({
    sections: [{
      items: menuItems
    }]
  });
  menu.on('select', function(e) {
    renderExpenses(month, e.item.title.split(':')[0]);
  });
  menu.show();
}

function renderExpenses(month, type){
  var expenses = getItem('expenses');
  expenses = _.sortBy(expenses, function(expense){ return expense.timestamp * -1; });
  var menuItems = [];
  if(type !== 'Total'){
    expenses = _.filter(expenses, function(expense){ return expense.type === type && monthNames[new Date(expense.timestamp).getMonth()] === month; });
  }
  menuItems = _.map(expenses, function(expense){
    return{
      title: formatDate(new Date(expense.timestamp)),
      subtitle: formatMoney(expense.money) + ' - ' + expense.type
    };
  });


  var menu = new UI.Menu({
    sections: [{
      items: menuItems
    }]
  });

  menu.show();
}

main();