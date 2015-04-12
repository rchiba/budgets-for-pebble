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

var splashWindow = new UI.Window();
var dollars = 0;
var cents = 0;
var dollarElement;
var centElement;
var selectionState = 0;
var defaultBudgets = [
  {type: 'Food', money: 1000},
  {type: 'Transit', money: 2000},
  {type: 'Fun', money: 3000}
];
var budgets = Settings.option('budgets');
var screenX = 144;
var screenY = 168;
var monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
var successMessages = ['Awesome!', 'Great job!', 'You got it!', 'Yay!', 'F*ck Yea!', 'Wut wut!', 'Nice!', 'Sweet!', 'Hi five!'];

// If budget is not saved in settings, save default budgets
if(!budgets){
  Settings.option('budgets', JSON.stringify(defaultBudgets));
  budgets = defaultBudgets;
}
var settingsUrl = 'http://ryochiba.com/projects/budgets-for-pebble/settings.html?budgets=' + encodeURIComponent(JSON.stringify(budgets));

Settings.config(
  { url: settingsUrl },
  function(e) {
    console.log('opening configurable');
  },
  function(e) {
    console.log('closed configurable');
    console.log('Options: ' + JSON.stringify(e.options));

    if(e.options.budgets)
    Settings.option('budgets', e.options.budgets);
  }
);

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
      font:dollarFont,
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

  var dollarFont = 'BITHAM_42_BOLD';
  console.log('dollars: '+dollars);
  if(dollars >= 100){
    dollarFont = 'BITHAM_30_BLACK';
  }
  console.log('dollarfont: '+dollarFont);
  
  dollarElement.text(dollarText).color(dollarColor).backgroundColor(dollarBG).font(dollarFont);
  centElement.text(centText).color(centColor).backgroundColor(centBG);
  
}

function renderExpenseTypeMenu(){
  
  var items = [];
  for(var i = 0; i < budgets.length; i++){
    items.push({title: budgets[i].type});
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
  if(typeof fastInterval !== 'undefined'){
    clearInterval(fastInterval);
    fastInterval = undefined;
  }

  if(selectionState === 1){
    renderExpenseTypeMenu();
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
  
  
  Vibe.vibrate('short');
  renderSuccessWindow(expense);
}

function renderSuccessWindow(expense){
  var successWindow = new UI.Window();
  var successMessage = successMessages[Math.floor(Math.random()*successMessages.length)];

  var successMessageText = new UI.Text({
    position: new Vector2(0, 0),
    size: new Vector2(screenX, 20),
    text:successMessage,
    font:'GOTHIC_14',
    color:'white',
    textOverflow:'wrap',
    textAlign:'center',
    backgroundColor:'clear'
  });

  var expenses = getItem('expenses');
  expenses = _.filter(expenses, function(fexpense){ return new Date(fexpense.timestamp).getMonth() === new Date().getMonth() && fexpense.type === expense.type; });
  expensesTotal = _.reduce(expenses, function(mod, num){ return mod + num.money; }, 0);
  budgetMoney = _.findWhere(budgets,{ type: expense.type }).money;
  moneyLeft = budgetMoney - expensesTotal;
  addBudgetItem(successWindow, 20, expense.type, expenses);

  var infoText = new UI.Text({
    position: new Vector2(0, 70),
    size: new Vector2(screenX, 30),
    text: 'You have ' + formatMoney(moneyLeft) + ' left in your ' + expense.type + ' budget',
    font:'GOTHIC_14',
    color:'white',
    textOverflow:'wrap',
    textAlign:'center',
    backgroundColor:'clear'
  });

  successWindow.add(successMessageText);
  successWindow.add(infoText);
  successWindow.show(successMessageText);
  successWindow.show(infoText);

  successWindow.on('click', 'select', function(){
    successWindow.hide();
  });

}

function renderAppMainMenu(e){
  var menu = new UI.Menu({
    sections: [{
      items: [
      {
        title: 'Budgets'
      },{
        title: 'Track Expense'
      }, {
        title: 'Expenses'
      }, {
        title: 'Reset Data'
      }]
    }]
  });
  menu.on('select', function(e) {
    if(e.item.title === 'Track Expense'){
      menu.hide();
    } else if(e.item.title === 'Expenses'){
      renderExpensesSummaryMenu();
    } else if(e.item.title === 'Budgets'){
      var currentMonth = monthNames[new Date().getMonth()];
      renderBudget(currentMonth);
    } else if(e.item.title === 'Reset Data'){
      renderResetConfirmation();
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

function renderResetConfirmation(){
  var card = new UI.Card({
    title: 'Are you sure?',
    subtitle: 'This will remove all of your transactions PERMANENTLY.',
    action: {
      up: 'SMALL_CHECK',
      down: 'SMALL_X'
    }
  });
  card.on('click', 'up', function(){
    localStorage.clear();
    Vibe.vibrate('short');
    var confirmation = new UI.Card({
      title: 'Transactions erased'
    });
    confirmation.show();
    setTimeout(function(){
      confirmation.hide();
      card.hide();
    }, 1000);
  });
  card.on('click', 'down', function(){
    card.close();
  });
  card.show();
}

function renderBudget(month){
  console.log('renderBudget: '+month);
  var expenses = getItem('expenses');
  expenses = _.filter(expenses, function(expense){ return monthNames[new Date(expense.timestamp).getMonth()] === month; });

  var budgetWindow = new UI.Window({
    scrollable: true
  });

  if(budgets.length === 0){
    var title = new UI.Text({
      position: new Vector2(padding, 0),
      size: new Vector2(screenX, screenY),
      text: 'Add budgets via the settings on phone to see them here.',
      font:'GOTHIC_18_BOLD',
      color:'white',
      textOverflow:'wrap',
      textAlign:'left',
      backgroundColor:'clear'
    });
    budgetWindow.add(title);
    budgetWindow.show(title);
  } else {
    // add total
    console.log('about to add total');
    addBudgetItem(budgetWindow, 0, 'Total', expenses);

    // add categories
    _.each(budgets, function(budget, index){
      var type = budget.type;
      var expensesOfType = _.filter(expenses, function(expense){ return expense.type === budget.type; });
      addBudgetItem(budgetWindow, (index+1) * 50, type, expensesOfType);
    });
  }
}

function addBudgetItem(wind, verticalOffset, type, expenses){
  console.log('addBudgetItem: '+JSON.stringify(type)+'|'+JSON.stringify(expenses));
  var budget;
  var expenseTotal;
  var padding = 10;

  if(typeof expenses !== 'undefined' && expenses.length > 0){
    console.log('adding all expenses');
    expenseTotal = _.reduce(_.map(expenses, function(expense){ return expense.money; }), function(memo, num){ return memo + num; });
  } else{
    console.log('no expenses');
    expenseTotal = 0;
  }

  if( type === 'Total' ){
    // total - add all budget monies together
    console.log('Budgets: '+JSON.stringify(budgets));
    budgetMoney = _.reduce(budgets, function(memo, num){ return memo + num.money; }, budgets[0].money);
  } else{
    // type - get money for that specific budget
    budgetMoney = _.findWhere(budgets,{ type: type }).money;
  }

  console.log('Type: '+type);
  console.log('Budget: '+JSON.stringify(budgetMoney));

  var title = new UI.Text({
    position: new Vector2(padding, verticalOffset),
    size: new Vector2(screenX, 20),
    text:type,
    font:'GOTHIC_18_BOLD',
    color:'white',
    textOverflow:'wrap',
    textAlign:'left',
    backgroundColor:'clear'
  });

  var barY = verticalOffset + 38;
  var barX = padding;
  var barHeight = 10;
  var barWidth = screenX - padding * 2;
  var fillPercent = (expenseTotal > budgetMoney) ? 1 : expenseTotal / budgetMoney;

  console.log('Fill percent: '+expenseTotal+' / '+budgetMoney+': '+fillPercent);

  var bar = new UI.Rect({
    position: new Vector2(barX, barY),
    size: new Vector2(barWidth, barHeight),
    backgroundColor: 'black',
    borderColor: 'white'
  });

  var filledBar = new UI.Rect({
    position: new Vector2(barX, barY),
    size: new Vector2(0, barHeight),
    backgroundColor: 'white',
    borderColor: 'white'
  });

  var subtitleWidth = 100;
  var subtitleHeight = 20;
  var subtitle = new UI.Text({
    position: new Vector2(barX + barWidth - subtitleWidth, barY - subtitleHeight),
    size: new Vector2(subtitleWidth, subtitleHeight),
    text: formatMoney(expenseTotal) + ' of ' + formatMoney(budgetMoney),
    font: 'GOTHIC_14',
    color: 'white',
    textAlign: 'right',
    backgroundColor: 'clear'
  });

  wind.add(title);
  wind.add(bar);
  wind.add(filledBar);
  wind.add(subtitle);

  wind.show(title);
  wind.show(bar);
  wind.show(filledBar);
  wind.show(subtitle);

  filledBar.animate('size', new Vector2(Math.floor(barWidth * fillPercent), barHeight), 700);
}

main();