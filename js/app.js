/*  
    Title: SelectJS MultiSelect Dropdown
    Author: Adel Sadek
    Date: 03/10/2019,
    version: 1.0.0

*/

var UIController = (function () {
    var DOMStrings = {
        smoothy: '.smoothy',
        smoothContainer: '.smoothy__items',
        smoothItem: '.smoothy__item',
        smoothItemLabel: '.label',
        smoothItemImage: '.image',
        smoothSelectedItems: '.smoothy__selected__items',
        removeIcon: '.remove_icon',
        checkbox: '.checkbox',
        search: '.smoothy__search'
    }


    return {
        getDOMStrings: function () {
            return DOMStrings
        },
        getSelectValue: function (event) {
            return {
                label: event.querySelector('.label').innerHTML,
                image: event.querySelector('.image > img').src,
            }
        },
        appendItem: function (obj, type) {
            var html, newHtml, element;

            if (type == 'checked') {
                element = DOMStrings.smoothSelectedItems;
                html = '<div class="smoothy__item--checked" id="item-%id%"><div class="image"><img src="%src%" alt="image"></div><label class="label" for="item">%label%</label><span class="remove_icon">X</span></div>'
            } else if (type == 'unchecked') {
                element = DOMStrings.smoothContainer;
                html = '<div class="smoothy__item" id="select-%id%"> <div class="image"><img src="%src%" alt="image"></div><label class="label">%label%</label><div class="checkbox"><input type="checkbox" name="item_1" id="item_1"></div></div>';
            }

            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%src%', obj.image);
            newHtml = newHtml.replace('%label%', obj.label);
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },
        deleteItem: function (selectorID) {
            var ele;
            ele = document.getElementById(selectorID);
            ele.parentNode.removeChild(ele)
        }
    }

})();

var SmoothyController = (function () {
    var ID, newItem, data;

    data = {
        checked: [],
        unchecked: [],
    }

    return {
        addItem: function (label, imageSrc, type) {
            // Set ID
            if (data[type].length > 0) {
                ID = data[type][data[type].length - 1].id + 1;
            } else {
                ID = 0
            }
            newItem = {
                label: label,
                image: imageSrc,
                id: ID
            }
            data[type].push(newItem);
            return newItem
        },
        removeItem: function (id, type) {
            var ids, index
            ids = data[type].map(current => {
                return current.id
            })
            index = ids.indexOf(id);
            if (index > -1) {
                data[type].splice(index, 1);
            }
        },
        getItem: function (id, type) {
            var newItem;
            data[type].map(item => {
                item.id === id ? newItem = item : -1;
            });

            return newItem;
        }
    }

})();

var selectJS = (function (UI, Smooth) {

    // GET DOM SELECTOR
    var DOM = UI.getDOMStrings();

    // SETUP EVENT LISTENER
    var setupEventListener = function () {
        document.querySelector(DOM.smoothy + ' ' + DOM.search).addEventListener('focus', showList);
        document.querySelector(DOM.smoothy + ' ' + DOM.search).addEventListener('blur', hideList);
        document.querySelector(DOM.smoothy + ' ' + DOM.search).addEventListener('keyup', filterItem);
        document.addEventListener('click', hideList);
        document.querySelector(DOM.smoothy + ' ' + DOM.smoothSelectedItems).addEventListener('click', removeItem);
        document.querySelector(DOM.smoothy + ' ' + DOM.smoothContainer).addEventListener('click', checkItem);

    }

    // SHOW ITEM LIST ONCE HIT INPUT 
    var showList = function () {
        document.querySelector(DOM.smoothContainer).classList.add('show-list');
    }

    // HIDE ITEM LIST ONCE LOSE FOCUS
    var hideList = function (event) {
        if (document.querySelector(DOM.smoothy) !== event.target && document.querySelector(DOM.search) !== event.target) {
            document.querySelector(DOM.smoothContainer).classList.remove('show-list');
        }
    }

    // MARK ITEM AS SELECTED 
    var checkItem = function (event) {
        var Data, newItem, element, selector, ID;

        // Select Checkbox 
        if (event.target.classList.contains(DOM.smoothItem.replace('.', ''))) { // 3 => image, checkbox, label
            element = event.target.children.item(2).children.item(0);
            selector = event.target;
        } else if (event.target.classList.contains(DOM.smoothItemLabel.replace('.', ''))) {
            element = event.target.parentNode.children.item(2).children.item(0);
            selector = event.target.parentNode;
            hasEvent = true;
        }
        else if (event.target.parentNode.classList.contains(DOM.smoothItemImage.replace('.', ''))) {
            element = event.target.parentNode.parentNode.children.item(2).children.item(0);
            selector = event.target.parentNode.parentNode;
        }

        // get item target data
        Data = UI.getSelectValue(selector);

        if (!element.checked) {
            // Add To SmoothCtrl
            newItem = Smooth.addItem(Data.label, Data.image, 'checked');

            // Add To UICtrl and display the item
            UI.appendItem(newItem, 'checked');

            // Change Status of check
            element.checked = !element.checked;

            // Remove item from unchecked structure
            ID = selector.id.split('-')[1] * 1;
            Smooth.removeItem(ID, 'unchecked');

            // remove item from UI
            UI.deleteItem(selector.id);
        }

        // selector.remove();
    }

    // Delete Item
    var removeItem = function (event, type) {
        var itemID, splitID, type, ID, item;
        // Check type if equal check => remove item from check items list
        if (type === 'check') {
            itemID = event.target.id;
        } else {
            itemID = event.target.parentNode.id;
        }

        if (itemID) {
            splitID = itemID.split('-');
            ID = parseInt(splitID[1]);
        } else {
            return;
        }

        // Append item to unchecked structure
        item = Smooth.getItem(ID, 'checked');
        item = Smooth.addItem(item.label, item.image, 'unchecked');
        UI.appendItem(item, 'unchecked');

        // delete item from data structure
        Smooth.removeItem(ID, 'checked');

        // delete item from UI
        UI.deleteItem(itemID);
    }

    // SEARCH FILTER ITEM
    var filterItem = function (event) {
        var inputValue, items, itemValue, itemLabel;

        inputValue = event.target.value.toUpperCase();

        items = Array.from(document.querySelectorAll(DOM.smoothy + ' ' + DOM.smoothItem));

        items.filter(function (item, index) {
            itemLabel = item.querySelector(DOM.smoothItemLabel);

            itemValue = itemLabel.textContent || itemLabel.innerHTML;

            if (itemValue.toUpperCase().indexOf(inputValue) > -1) {
                item.style.display = "";
            } else {
                item.style.display = "none";
            }
        })

    }

    return {
        init: function (HTMLElement, arr) {
            var newItem, htmlWrapper;

            // Render HTML 
            htmlWrapper ='<div class="smoothy"><div class="smoothy__selected__items"></div><input type="text" class="smoothy__search" placeholder="Search..."><div class="smoothy__items"></div></div>';
            HTMLElement.innerHTML = htmlWrapper;
            
            setupEventListener();

            if (arr.length) {
                for (var i = 0; i < arr.length; i++) {

                    // check if item checked
                    if (arr[i].checked) {
                        // Add Items To checked Structure
                        newItem = Smooth.addItem(arr[i].label, arr[i].image, 'checked');

                        // Append Items To UI checked 
                        UI.appendItem(newItem, 'checked');
                    } else {
                        // Add item to unchecked item structure
                        newItem = Smooth.addItem(arr[i].label, arr[i].image, 'unchecked');

                        // Append Item To Unchecked
                        UI.appendItem(newItem, 'unchecked');
                    }
                }
            }
        }
    }

})(UIController, SmoothyController);

