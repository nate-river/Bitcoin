$(function(){
    var $el = $('.stock-show');
    $el.css({marginTop: ($(window).height()-$el.innerHeight())/2 })
    $(window).resize(function(){
        $el.css({marginTop: ($(this).height()-$el.innerHeight())/2 })
    });
    function market( elPriceId,elExtraId,name,apiUrl){
        this.upColor ='#64a803'; 
        this.downColor ='#cc2630'; 
        this.name = name;
        this.price = new Array(2);
        this.elPrice = $('#'+elPriceId); 
        this.elExtra = $('#'+elExtraId); 
        this.rate = 6.15;
        this.apiUrl = apiUrl;
        this.getRate();
        this.makeConnection();
    }
    market.prototype.start = function(data){
        if ( !this.price[0]){
            this.price[0] = data;
            this.price[1] = data;
        }else{
            this.price[0] = this.price[1]
            this.price[1] = data;
        }
        if ( this.price[0] < this.price[1] )
            this.elPrice.parent().css({'webkitTransform':'scale(1.1,1.1)', 'color':this.upColor});
        if ( this.price[0] > this.price[1] )
            this.elPrice.parent().css({'webkitTransform':'scale(1,1)', 'color':this.downColor}); 
        var intFrom = this.price[0]*100;
        var intTo = this.price[1]*100;
        var that = this;
        $({someValue:intFrom }).animate(
            {someValue: intTo}, {
                duration: 700,
                easing:'swing',
                step: function() {
                    var extra = ( '$' + Math.round(this.someValue) ).slice(-2);
                    that.elPrice.text( '$' + Math.round(this.someValue/100) );
                    that.elExtra.text( '.' + extra );
                }
            });
    }
    market.prototype.makeConnection = function(){
        var that = this;
        if(this.name == 'btcChina'){
            var socket = io('https://websocket.btcchina.com/');
            socket.emit('subscribe', ['marketdata_cnybtc']);
            socket.on('connect', function(){
                socket.on('trade', function (data) {
                    that.start( parseFloat(data.price).toFixed(2) );
                })
            })
            return;
        }
        setInterval(function(){
            $.ajax({
                url:that.apiUrl,
                dataType:"json",
                success:function(data){
                    if(that.name=="huoBi")
                        that.start( parseFloat( data.ticker.last ).toFixed(2) );
                    if(that.name=='bitstamp')
                        that.start( parseFloat( data.bpi.USD.rate_float*that.rate ).toFixed(2) );
                }
            });
        },3000)
    }
    market.prototype.getRate = function(){
        var that = this;
        $.ajax({
            url:'http://api.k780.com:88/?app=finance.rate&scur=USD&tcur=CNY&appkey=10003&sign=b59bc3ef6191eb9f747dd4e83c99f2a4&format=json',
            dataType:"json",
            success:function(data){
                that.rate = parseFloat(data.result.rate);
            }
        });
    }
    new market('price1','extra1','btcChina');
    new market('price2','extra2','huoBi','http://market.huobi.com/staticmarket/ticker_btc_json.js');
    new market('price3','extra3','bitstamp','http://api.coindesk.com/v1/bpi/currentprice.json');
});