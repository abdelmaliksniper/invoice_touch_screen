odoo.define('invoice_touch_screen.TouchPage', function(require) {
    'use strict';

    var core = require('web.core');
    var Model = require('web.DataModel');
    var Widget = require('web.Widget');
    var session = require('web.session');
    var utils = require('web.utils');
    var formats = require('web.formats');
    var _t = core._t;
    var QWeb = core.qweb;
    var Backbone = window.Backbone;
    //////////////////////////////////////////////////
    var ord = [];
    var ord_id = 0;
    var part_id;
    var vw = "";
    var prod;
    var prod_id;
    var modee = "";
    var sig = 0;
    var tot = 0.0;
    var newbuf;
    var a_i = '';
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    var ActionpadWidget_1 = Widget.extend({
    template: 'ActionpadWidget_1',
    init: function(parent) {
        var self = this;
        this._super(parent);
    },
    start: function(){
        this.$el.find('.pay').click(_.bind(this.pay_cl, this));
        new Model("res.partner")
                 .query(["id", "name"])
                 .filter([['name', '=', "Default Customer"]])
                 .first()
                 .then(function (results){
                     part_id = results.id;
                 });
        new Model("ir.ui.view")
                 .query(["id", "name"])
                 .filter([['name', '=', "account.invoice.form"]])
                 .first()
                 .then(function (res){
                     vw = res.id;
                 });
    },
    pay_cl: function(event) {

        var inv = [];
        for(var i = 0; i < ord.length; i++){

        inv[i] = {
        'product_id': parseInt(ord[i].id),
        'name': ord[i].name+'',
        'price_unit': parseFloat(ord[i].pri),
        'quantity': parseFloat(ord[i].qty),
        'discount': parseFloat(ord[i].disc),
        'account_id': parseInt(ord[i].acc_no.split(",")),
        //'price_subtotal': parseFloat(ord[i].subb)
        }
        }
        this.do_action({
        name: _t('account.invoice.form'),
        type: 'ir.actions.act_window',
        res_model: 'account.invoice',
        view_mode: 'form',
        view_type: 'form',
        views: [[vw, 'form']],
        target: 'new',
        context: {
        default_partner_id: part_id,
        default_reference: false,
        default_invoice_line_ids: inv,
        default_type: 'out_invoice',
        default_pr_net: 0.0,
        default_shop_net: parseFloat(tot),
        },
        });

        ////////////////////////////////////////////////////////////////////////////
        ord = [];
        prod_id = 0;
        sig = 0;
        tot = 0.0;
        this.order_widget = new OrderWidget_1(this,ord);
        this.order_widget.appendTo(self.$('.placeholder-OrderWidget'));
        ////////////////////////////////////////////////////////////////////////////
    },

    });
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    var NumpadState = Backbone.Model.extend({
    defaults: {
        buffer: "0",
        mode: "quantity"
    },
    appendNewChar: function(newChar) {
        var oldBuffer;
        oldBuffer = this.get('buffer');
        if (oldBuffer === '0') {
            this.set({
                buffer: newChar
            });
        } else if (oldBuffer === '-0') {
            this.set({
                buffer: "-" + newChar
            });
        } else {
            this.set({
                buffer: (this.get('buffer')) + newChar
            });
        }
        this.trigger('set_value',this.get('buffer'));
    },
    deleteLastChar: function() {
        if(this.get('buffer') === ""){
            if(this.get('mode') === 'quantity'){
                this.trigger('set_value','remove');
            }else{
                this.trigger('set_value',this.get('buffer'));
            }
        }else{
            var newBuffer = this.get('buffer').slice(0,-1) || "";
            this.set({ buffer: newBuffer });
            this.trigger('set_value',this.get('buffer'));
        }
    },
    switchSign: function() {
        var oldBuffer;
        oldBuffer = this.get('buffer');
        this.set({
            buffer: oldBuffer[0] === '-' ? oldBuffer.substr(1) : "-" + oldBuffer
        });
        this.trigger('set_value',this.get('buffer'));
    },
    changeMode: function(newMode) {
        this.set({
            buffer: "0",
            mode: newMode
        });
    },
    reset: function() {
        this.set({
            buffer: "0",
            mode: "quantity"
        });
    },
    resetValue: function(){
        this.set({buffer:'0'});
    },
    });
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    var NumpadWidget_1 = Widget.extend({
        template:'NumpadWidget_1',

        init: function(parent) {
            this._super(parent);
            this.state = new NumpadState();
            a_i = '';
            this.decimal_separator = _t.database.parameters.decimal_point;
            this.firstinput = true;

        },
        start: function() {
            this.state.bind('change:mode', this.changedMode, this);
            this.changedMode();
            this.$el.find('.numpad-backspace').click(_.bind(this.click_numpad, this));
            this.$el.find('.numpad-minus').click(_.bind(this.click_numpad, this));
            this.$el.find('.number-char').click(_.bind(this.click_numpad, this));
            this.$el.find('.oe_new').click(_.bind(this.clickChangeMode, this));
            this.$el.find('.mode-button').click(_.bind(this.clickChangeMode, this));
            this.actionpad = new ActionpadWidget_1(this,{});
            this.actionpad.replace(this.$('.placeholder-ActionpadWidget'));
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ
        },
        click_numpad: function(event){
        if(ord.length !== 0)
        {

            newbuf = this.numpad_input(
            a_i,
            $(event.target).data('action'),
            {'firstinput': this.firstinput});

            this.firstinput = (newbuf.length === 0);

            if (newbuf !== a_i) {
            a_i = newbuf;
            }

            /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            var dis = 0;
            if(modee === "quantity"){
            dis = parseFloat(a_i) || 1;
            }
            else if(modee === "discount")
            {
            dis = parseFloat(a_i) || 0;
            }

            //var ii = 0;
            for(var i = 0; i < ord.length; i++){
               if(parseInt(ord[i].id) === parseInt(ord_id) && modee === 'discount'){
                  //var dx = (dis * 100.0) / (parseFloat(ord[i].qty) * parseFloat(ord[i].pri));
                  ord[i] = {"id": ord[i].id, "name": ord[i].name, "qty": ord[i].qty, "pri": ord[i].pri, "disc": dis || 0, "subb": (ord[i].pri * ord[i].qty)-((ord[i].pri * ord[i].qty) * dis / 100.0), "acc_no": ord[i].acc_no};
                  tot = 0;
                  for(var i = 0; i < ord.length; i++){
                  tot+= parseFloat(ord[i].subb);
                  }

                  this.order_widget1 = new OrderWidget_1(this,ord);
                  this.order_widget1.appendTo(self.$('.placeholder-OrderWidget'));

               }
               else if(parseInt(ord[i].id) === parseInt(ord_id) && modee === 'quantity'){
                  //var dx1 = (parseFloat(ord[i].disc) * 100.0) / (dis * parseFloat(ord[i].pri));
                  ord[i] = {"id": ord[i].id, "name": ord[i].name, "qty": dis || 1, "pri": ord[i].pri, "disc": ord[i].disc, "subb": (ord[i].pri * dis)-((ord[i].pri * dis) * ord[i].disc / 100.0), "acc_no": ord[i].acc_no};
                  tot = 0;
                  for(var i = 0; i < ord.length; i++){
                  tot+= parseFloat(ord[i].subb);
                  }
                  this.order_widget1 = new OrderWidget_1(this,ord);
                  this.order_widget1.appendTo(self.$('.placeholder-OrderWidget'));
               }

            }
        }
            /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



        },
        numpad_input: function(buffer, input, options) {
            var newbuf  = buffer.slice(0);
            options = options || {};
            var newbuf_float  = formats.parse_value(newbuf, {type: "float"}, 0);
            var decimal_point = _t.database.parameters.decimal_point;

            if (input === decimal_point) {
                if (options.firstinput) {
                   newbuf = "0.";
                }else if (!newbuf.length || newbuf === '-') {
                   newbuf += "0.";
                } else if (newbuf.indexOf(decimal_point) < 0){
                   newbuf = newbuf + decimal_point;
                }
            } else if (input === 'CLEAR') {
                newbuf = "";

            } else if (input === 'BACKSPACE') {
               newbuf = newbuf.substring(0,newbuf.length - 1);
            } else if (input === '+') {
            if ( newbuf[0] === '-' ) {
                newbuf = newbuf.substring(1,newbuf.length);
            }
        } else if (input === '-') {
            if ( newbuf[0] === '-' ) {
                newbuf = newbuf.substring(1,newbuf.length);
            } else {
                newbuf = '-' + newbuf;
            }
        } else if (input[0] === '+' && !isNaN(parseFloat(input))) {
            newbuf = newbuf_float + parseFloat(input);
        } else if (!isNaN(parseInt(input))) {
            if (options.firstinput) {
                newbuf = '' + input;
            } else {
                newbuf += input;
            }
        }

        // End of input buffer at 12 characters.
        if (newbuf.length > buffer.length && newbuf.length > 12) {
            this.play_sound('bell');
            return buffer.slice(0);
        }

           return newbuf;
        },
        play_sound: function(sound) {
           var src = '';
           if (sound === 'error') {
              src = "/invoice_touch_screen/static/src/sounds/error.wav";
           } else if (sound === 'bell') {
              src = "/invoice_touch_screen/static/src/sounds/bell.wav";
           } else {
            console.error('Unknown sound: ',sound);
            return;
        }
        $('body').append('<audio src="'+src+'" autoplay="true"></audio>');
    },
        clickDeleteLastChar: function() {
            return this.state.deleteLastChar();
        },
        clickSwitchSign: function() {
            return this.state.switchSign();
        },
        clickAppendNewChar: function(event) {
            var newChar;
            newChar = event.currentTarget.innerText || event.currentTarget.textContent;
            return this.state.appendNewChar(newChar);
        },
        clickChangeMode: function(event) {
            var newMode = event.currentTarget.attributes['data-mode'].nodeValue;
            if(newMode === "nn"){
            ord = [];

            prod_id = 0;

            sig = 0;
            tot = 0.0;
            this.order_widget = new OrderWidget_1(this,ord);
            this.order_widget.appendTo(self.$('.placeholder-OrderWidget'));
            }else
            {
            //this.state = new NumpadState();
            a_i = '';
            return this.state.changeMode(newMode);
            }
            //this.$('.value').text("");

        },
        changedMode: function() {
            modee = this.state.get('mode');
            var mode = this.state.get('mode');
            $('.selected-mode').removeClass('selected-mode');
            $(_.str.sprintf('.mode-button[data-mode="%s"]', mode), this.$el).addClass('selected-mode');
        }
    });

    var ProductsWidget = Widget.extend({
        template: "ProductListWidget_1",


        init: function(parent, pp){
        var self = this;
        this._super(parent);
        this.pp = pp;
        },

        //ttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttt


        start: function(){
        this.$el.find('.eo_myDIV').click(_.bind(this.clickChangeMode, this));
        },
        clickChangeMode: function(event) {
        var c = event.currentTarget.childNodes;
        var tar = 0;
        a_i = '';
        if(ord.length > 0)
        {
        for(var i = 0; i < ord.length; i++){
        if(ord[i].id === c[1].value){
        //var dx2 = (parseFloat(ord[i].disc) * 100.0) / ((parseFloat(ord[i].qty) + 1) * parseFloat(c[3].value));
        ord[i] = {"id": c[1].value, "name": c[2].value, "qty": ord[i].qty + 1, "pri": c[3].value, "disc": ord[i].disc, "subb": (c[3].value * (ord[i].qty + 1))-((c[3].value * (ord[i].qty + 1)) * ord[i].disc / 100.0 ), "acc_no": c[4].value};
        ord_id = c[1].value;
        tar = 1;
        }}
        }
        else{
        ord[sig] = {"id": c[1].value, "name": c[2].value, "qty": 1, "pri": c[3].value, "disc": 0, "subb": c[3].value * 1, "acc_no": c[4].value};
        sig+=1;
        ord_id = c[1].value;
        tar = 2;
        this.pp = ord;
        tot = 0;
        for(var i = 0; i < ord.length; i++){
                  tot+= parseFloat(ord[i].subb);
        }
        self.order_widget = new OrderWidget_1(self,ord);
        self.order_widget.appendTo(self.$('.placeholder-OrderWidget'));

        }

        if(tar === 1){
        this.pp = ord;
        ord_id = c[1].value;
        tot = 0;
        for(var i = 0; i < ord.length; i++){
                  tot+= parseFloat(ord[i].subb);
                  }
        self.order_widget = new OrderWidget_1(self,ord);
        self.order_widget.appendTo(self.$('.placeholder-OrderWidget'));

        }
        else if(tar === 0){
        ord[sig] = {"id": c[1].value, "name": c[2].value, "qty": 1, "pri": c[3].value, "disc": 0, "subb": c[3].value * 1, "acc_no": c[4].value};
        sig+=1;
        ord_id = c[1].value;
        tot = 0;
        for(var i = 0; i < ord.length; i++){
                  tot+= parseFloat(ord[i].subb);
                  }
        self.order_widget = new OrderWidget_1(self,ord);
        self.order_widget.appendTo(self.$('.placeholder-OrderWidget'));

        }
        },


    });
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    var ProductScreenWidget_1 = Widget.extend({
        template:'ProductScreenWidget_1',

        init: function(parent){
        var self = this;
        this._super(parent);
        this.clear_search_handler = function(event){
            self.clear_search();
        };
        var search_timeout  = null;
        this.search_handler = function(event){
            if(event.type == "keypress" || event.keyCode === 46 || event.keyCode === 8){
                clearTimeout(search_timeout);

                var searchbox = this;

                search_timeout = setTimeout(function(){
                    self.perform_search(searchbox.value, event.which === 13);
                },70);
            }
        };
        ////////////////////////////////////////////
        },
        start: function(){
            var self = this;

            this.numpad = new NumpadWidget_1(this,{});
            this.numpad.replace(this.$('.placeholder-NumpadWidget'));
            this.el.querySelector('.searchbox1 input').addEventListener('keypress',this.search_handler);
            this.el.querySelector('.searchbox1 input').addEventListener('keydown',this.search_handler);
            this.el.querySelector('.search-clear').addEventListener('click',this.clear_search_handler);

            this.order_widget = new OrderWidget_1(this,ord);
            this.order_widget.appendTo(self.$('.placeholder-OrderWidget'));

            new Model("product.product")
                 .query(["id", "name", "list_price", "property_account_income_id", "image"])
                 .filter([['sale_ok', '=', true]])
                 .limit(1000)
                 .all({'shadow': true})
                 .then(function (results){
                     prod = results;
                     this.product_list_widget = new ProductsWidget(this,results);
                     this.product_list_widget.appendTo(self.$('.placeholder-ProductListWidget'));
                 });
        },
        ////////////////////////////////
        clear_search: function(){
        new Model("product.product")
                 .query(["id", "name", "list_price", "property_account_income_id", "image"])
                 .filter([['sale_ok', '=', true]])
                 .limit(1000)
                 .all({'shadow': true})
                 .then(function (results){
                     prod = results;
                     self.product_list_widget = new ProductsWidget(self,results);
                     self.product_list_widget.appendTo(self.$('.placeholder-ProductListWidget'));
                 });

        var input = self.el.querySelector('.searchbox1 input');
            input.value = '';
            input.focus();
        },
        //tttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttt
        perform_search: function(query, buy_result){

        if(query){
        new Model("product.product")
                 .query(["id", "name", "list_price", "property_account_income_id", "image"])
                 .filter([['sale_ok', '=', true], ['name', 'like', query]])
                 .limit(1000)
                 .all({'shadow': true})
                 .then(function (results){
                     prod = results;
                     self.product_list_widget = new ProductsWidget(self,results);
                     self.product_list_widget.appendTo(self.$('.placeholder-ProductListWidget'));
                 });
        }
        else{
        new Model("product.product")
                 .query(["id", "name", "list_price", "property_account_income_id", "image"])
                 .filter([['sale_ok', '=', true]])
                 .limit(1000)
                 .all({'shadow': true})
                 .then(function (results){
                     prod = results;
                     self.product_list_widget = new ProductsWidget(self,results);
                     self.product_list_widget.appendTo(self.$('.placeholder-ProductListWidget'));
                 });

        }
        },
    });
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    var OrderWidget_1 = Widget.extend({
    template:'OrderWidget_1',
    init: function(parent, oo){
        this._super(parent);
        this.oo = oo;
        this.total = tot;

        },

    start: function(){
        this.$el.find('.eo_myDIV_1').click(_.bind(this.clickChangeMode_1, this));
        this.$el.find('.eo_tbl').click(_.bind(this.clickChangeMode_2, this));

    },
    clickChangeMode_1: function(event) {
        var c = event.currentTarget.childNodes;
        //if(ord)
        for(var i = ord.length - 1; i >= 0; i--){
        if(ord[i].id === c[1].value){
        ord.splice(i, 1);
        sig-=1;
        }
        }
        tot = 0;
        for(var i = 0; i < ord.length; i++){
                  tot+= parseFloat(ord[i].subb);
                  }
        this.order_widget = new OrderWidget_1(this,ord);
        this.order_widget.appendTo(self.$('.placeholder-OrderWidget'));
    },
    clickChangeMode_2: function(event) {
        var c = $(event.currentTarget).data('id');
        var tb = document.getElementsByName("tbl_id");
        for(var i = 0; i < tb.length; i++){
           tb[i].style.backgroundColor = "#c5c5c5";
        }
        event.currentTarget.style.backgroundColor = "#FFFFFF";
        ord_id = c;
    },

    });
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    core.action_registry.add('th.malik', ProductScreenWidget_1);
});
