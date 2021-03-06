function browseLabelCell(record) {
    var cell = document.createElement("td");

    if (record.title) {
        var title = document.createTextNode(record.title)
    } else {
        var title = document.createTextNode('')
    }

    cell.appendChild(document.createElement('div').appendChild(title));
    var a = document.createElement('a');
    a.style.display = 'block';
    if (record.url) { // url is optional, for manual subscriptions
        var linkText = document.createTextNode(record.url.replace(/http(s?):\/\/(www.|)/, '').substring(0, 40));
    } else {
        var linkText = document.createTextNode('');
    }
    a.appendChild(linkText);
    a.className = 'external-link';
    a.href = record.url;
    $(a).click(function() {
        // In a chrome popup
        // the links won't work without the below. Needs to be
        // re-ran on every table creation.
        chrome.tabs.create({
            url: $(this).attr('href')
        });
        return false;
    });
    cell.appendChild(a);
    return cell;
}

function subscriptionAmountCell(record) {
    var input = document.createElement("input");
    input.type = "number";
    input.setAttribute('step', '0.01');
    input.setAttribute('min', '0.10');
    input.className = "amount-fiat subscription-input";
    input.value = record.amountFiat;
    input.id = record.bitcoinAddress;

    input.addEventListener("change", function() {
        record.amountFiat = this.value;
        db.put('subscriptions', record);
        $('#subscriptionTotalAmount').html(subscriptionTotalAmount());
    });

    var cell = document.createElement("td");
    cell.appendChild(input);
    return cell;
}

function subscriptionBitcoinAddressCell(record) {
    var cell = document.createElement("td");
    cell.className = 'blockchain-address';
    cell.appendChild(
        document.createTextNode(
            record.bitcoinAddresses[0].substring(0, 7) + '...'
        )
    );
    return cell;
}

function subscriptionSwitchCell(record) {
    var cell = document.createElement("td");
    cell.style.textAlign = 'center';

    var input = document.createElement("input");
    input.type = "checkbox";
    input.checked = false;
    input.id = record.bitcoinAddress;

    input.className = 'js-switch'; // Switchery.js
    cell.appendChild(input); // append to cell before init Switchery

    new Switchery(input, {
        size: 'small'
    });
    input.addEventListener("change", (function(record, input) {
        return function() {
            var parentTr = input.parentElement.parentElement;
            if (input.checked != true) {
                db.remove('subscriptions', record.bitcoinAddresses[0]);
                parentTr.style.backgroundColor = 'white';
                parentTr.style.color = '#000';
            } else {
                // Allow the unsubscription to be reversed, no need to display confirmation warning
                // EG. "Do you really want to delete this subscription?"
                record.bitcoinAddress = record.bitcoinAddresses[0]
                record.amountFiat = localStorage['defaultSubscriptionAmountFiat'];
                db.put('subscriptions', record);
                parentTr.style.backgroundColor = '#eeeeee';
                parentTr.style.color = '#aaa';
                $('#subscriptions').effect("highlight", {
                    color: 'rgb(100, 189, 99)'
                }, 3000);
            }
        }
    })(record, input));

    return cell;
}

function browseIgnoreCell(record) {
    var cell = document.createElement("td");

    var removeIcon = document.createElement('span')
    removeIcon.setAttribute('title', "Ignore");
    removeIcon.className = 'glyphicon glyphicon-remove remove-icon ios-orange';

    removeIcon.onclick = function() {
        addToBlacklist(record.url);
        $(this.parentElement.parentElement).remove()
        $('#blacklist').effect("highlight", {
            color: '#fc0;'
        }, 1000);
    }
    cell.appendChild(removeIcon);
    return cell;
}

function browseAmountCell(record) {
    var incidentalAmount = parseFloat(localStorage["incidentalTotalFiat"]);

    var slice = (record.timeOnPage / localStorage['totalTime']).toFixed(2);
    var amountMoney = (slice * incidentalAmount).toFixed(2);
    var text = document.createTextNode(amountMoney);

    var cell = document.createElement("td");
    cell.className = 'fiat-amount';
    cell.appendChild(text);
    return cell;
}

function progressBarCell(record) {
    var incidentalAmount = parseFloat(localStorage["incidentalTotalFiat"]);

    var slice = (record.timeOnPage / localStorage['totalTime']).toFixed(2);
    var amountMoney = (slice * incidentalAmount).toFixed(2);
    var text = document.createTextNode(amountMoney);

    var cell = document.createElement("td");

    var progress = document.createElement('div');
    progress.className = 'progress';
    var progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';

    var priceCupCoffee = localStorage['priceOfCoffee'];
    // progress bar is three cups of coffee wide, so divide by three
    var numberOfCupsCoffeeInProgressBar = 2;
    var percentOfCupCoffee = (((amountMoney / priceCupCoffee) / numberOfCupsCoffeeInProgressBar) * 100).toFixed(2)
    progressBar.style.width = percentOfCupCoffee + '%';

    progress.appendChild(progressBar);
    cell = document.createElement("td");
    cell.appendChild(progress);

    return cell;
}

function createTotalCoffeeCupProgressBar(domId) {
    var totalAmountProgressBar = $('#' + domId);
    totalAmountProgressBar.empty();
    progress = document.createElement('div');
    progress.className = 'progress';
    progress.style.width = '47px';
    progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';

    //amountMoney = parseFloat(localStorage["totalAmount"]).toFixed(2);
    amountMoney = parseFloat($('#total-fiat-amount').html()).toFixed(2);

    priceCupCoffee = localStorage['priceOfCoffee'];
    //priceCupCoffee = 1.95;
    // progress bar is nine cups of coffee wide, so divide by nine.
    numberOfCupsCoffeeInProgressBar = 2;
    percentOfCupCoffee = (((amountMoney / priceCupCoffee) / numberOfCupsCoffeeInProgressBar) * 100).toFixed(2)
    progressBar.style.width = percentOfCupCoffee + '%';

    progress.appendChild(progressBar);
    totalAmountProgressBar.append(progress);
}

function refreshTotalCoffeeCupProgressBar(domId) {
    totalAmountProgressBar = $('#' + domId);
    totalAmountProgressBar.empty();
    // redraw
    progress = document.createElement('div');
    progress.className = 'progress';
    progress.style.width = '47px';
    progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';

    //amountMoney = parseFloat(localStorage["totalAmount"]).toFixed(2);
    amountMoney = parseFloat($('#total-fiat-amount').html()).toFixed(2);

    priceCupCoffee = localStorage['priceOfCoffee']; //1.95;
    // progress bar is two cups of coffee wide, so divide by two.
    numberOfCupsCoffeeInProgressBar = 2;
    percentOfCupCoffee = (((amountMoney / priceCupCoffee) / numberOfCupsCoffeeInProgressBar) * 100).toFixed(2)
    progressBar.style.width = percentOfCupCoffee + '%';

    progress.appendChild(progressBar);
    totalAmountProgressBar.append(progress);
}

function buildRow(record) {
    var row = document.createElement("tr");

    row.appendChild(subscriptionSwitchCell(record));
    row.appendChild(browseLabelCell(record));
    row.appendChild(browseAmountCell(record));
    row.appendChild(progressBarCell(record));
    row.appendChild(subscriptionBitcoinAddressCell(record));
    row.appendChild(browseIgnoreCell(record));

    return row;
}

function buildBrowsingTable(domId) {
    var tbody = $('#' + domId);
    tbody.empty();

    // The Sites records should be filtered,
    // first, by removing the subscriptions
    // second, by tallying up the total amount
    // of time spent overall.

    // Remove subscriptions for daily browsing.
    db.values('subscriptions').done(function(records) {
        for (var i in records) {
            db.remove('sites', records[i].url);
        }
    });

    // Update the totalTime, this global needs to be updated frequently to allow
    // the correct values for the percentages of each site.
    db.values('sites').done(function(records) {
        localStorage['totalTime'] = 0;
        for (var i in records) {
            if (records[i].timeOnPage) { // it is possible to get a new site record which doesn't yet have a timeOnPage.
                localStorage['totalTime'] = parseInt(localStorage['totalTime']) + parseInt(records[i].timeOnPage);
            }
        };
    });

    db.from('sites').order('timeOnPage').reverse().list(10).done(function(records) {
        for (var i in records) {
            tbody.append(buildRow(records[i]));
        }
    });
}