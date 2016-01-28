
require('./styles.styl');

var win = window;
var doc = document;

var tinycolor = require('tinycolor2');

module.exports = Ractive.extend({

    template: require('./template.html'),

    isolated: true,

    data: function() {
        return {

            showFormats: true,
            showSLPicker: true,
            showOpacitySlider: true,
            showHueSlider: true,
            showInputs: true,
            showValueInput: true,
            showHslInputs: true,
            showRgbInputs: true,

            format: 'Hex',
            base: '#00e3ff',

            // 0 - 255
            r: 50,
            g: 165,
            b: 191,

            // 0 - 1
            h: 0.53,
            s: 0.59,
            l: 0.47,

            a: 1,

            value: '#32a5bf',

        }
    },

    computed: {

        // 0 - 360
        hue: {
            get: function() { return round(this.get('h')*360) },
            set: function(h) {  this.set('h', h / 360) }
        },

        // 0 - 100
        saturation: {
            get: function() { return round(this.get('s')*100) },
            set: function(s) {  this.set('s', s / 100) }
        },

        // 0 - 100
        lightness: {
            get: function() { return round(this.get('l')*100) },
            set: function(l) {  this.set('l', l / 100) }
        },

        // get current value without any opacity
        opaque: function() {
            return tinycolor(this.get('value')).toHexString();
        },

        /**
        * Internal. Get the 'color' by its parts
        */
        _value: {

            get: function() {

                var format = this.get('format');

                var r = this.get('r');
                var g = this.get('g');
                var b = this.get('b');

                var h = this.get('h');
                var s = this.get('s');
                var v = this.get('l');
                var a = this.get('a');

                var color;

                if(format == 'Hsl')
                    color = tinycolor.fromRatio({h, s, v, a});
                else
                    color = tinycolor.fromRatio({r, g, b, a});

                if(a < 1 && format == 'Hex')
                    format += '8';

                return color[`to${format}String`]();
            },

            set: function(v) {

                var self = this;

                var format = this.get('format');
                var color = tinycolor(v);
                var hsv = color.toHsv();

                var n = {
                    s: hsv.s,
                    l: hsv.v,
                    a: hsv.a,
                    base: tinycolor.fromRatio({h: hsv.h, s: 1, v: 1}).toHexString(),
                }

                if( hsv.s !== 0 && hsv.v !== 0 )
                    n.h = hsv.h / 360;

                if(n.a < 1 && format == 'Hex')
                    format += '8';

                // update the public
                n.value = color[`to${format}String`]()

                self.fire('change');

                self.set(n);

            },
        },

    },

    oninit: function() {

        var self = this;

        //self.observe('_value', value => self.set('value', value));

        self.observe('value', value => {
            self.set('_value', value)
        });

        self.observe('h s l r g b a', function() {

            self.set('value', self.get('_value'));

        });

        // update rgb when hsv changes
        self.observe('h s l', function() {

            var h = this.get('h');
            var s = this.get('s');
            var v = this.get('l');

            var color = tinycolor.fromRatio({h, s, v});

            var rgb = color.toRgb();

            self.set({
                r: rgb.r,
                g: rgb.g,
                b: rgb.b,
            });

        }, {init: false});

        // update hsl when hsv changes
        //self.observe('r g b', function() {

            //// don't run this observer when dragging
            //// in the SL picker. It only causes reverb rounding errors
            //if(self._slMousedown)
                //return;

            //var r = this.get('r');
            //var g = this.get('g');
            //var b = this.get('b');

            //var color = tinycolor.fromRatio({r, g, b}).toHsv();

            //self.set({
                //h: color.h / 360,
                //s: color.s,
                //v: color.v,
            //});

        //}, {init: false});

        self.observe('a', function(a) {
            var format = this.get('format');
            if(a < 1 && format == 'Hex')
                this.set('format', 'Rgb');
        });

        self.on('hueMousedown slMousedown opacityMousedown', function(details) {

            var event = details.original;

            self['_'+details.name] = true;

            var hue = self.find('.hue');
            if(hue)
                self._hueRect = hue.getBoundingClientRect();

            var sl = self.find('.slPicker');
            if(sl)
                self._slRect = sl.getBoundingClientRect();

            var op = self.find('.opacity');
            if(op)
                self._opacityRect = op.getBoundingClientRect();

            self._lastMouseX = event.clientX;
            self._lastMouseY = event.clientY;

            document.addEventListener('mousemove', self.boundMouseMoveHandler);
            document.addEventListener('mouseup', self.boundMouseUpHandler);

            requestAnimationFrame(self.boundUpdate);
        });


        self.on('rgbChange', function(detail) {


            var r = this.get('r');
            var g = this.get('g');
            var b = this.get('b');

            var color = tinycolor({r,g,b});

            var hsv = color.toHsv();

            var n = {
                s: hsv.s,
                l: hsv.v,
            };

            if(color.s != 0 & color.h != 0 && !this._slMousedown)
                n.h = hsv.h/360;

            self.set(n);


        });

        //self.on('hslChange', function() {

            //var h = this.get('h');
            //var s = this.get('s');
            //var v = this.get('l');

            //var color = tinycolor.fromRatio({h, s, v});

            //var rgb = color.toRgb();

            //self.set({
                //r: rgb.r,
                //g: rgb.g,
                //b: rgb.b,
            //});

        //}, {init: false});

        self.boundMouseMoveHandler = self.mouseMoveHandler.bind(self);
        self.boundMouseUpHandler = self.mouseUpHandler.bind(self);
        self.boundUpdate = self.update.bind(self);

    },

    mouseMoveHandler: function(event) {

        var self = this;

        self._lastMouseX = event.clientX;
        self._lastMouseY = event.clientY;

    },

    mouseUpHandler: function(event) {

        var self = this;

        self._hueMousedown =
        self._slMousedown =
        self._opacityMousedown = false;

        document.removeEventListener('mousemove', self.boundMouseMoveHandler);
        document.removeEventListener('mouseup', self.boundMouseUpHandler);
    },

    update: function() {

        var self = this;

        if(self._hueMousedown) {

            var hue =  clamp((self._lastMouseY - self._hueRect.top) / self._hueRect.height, 0, 1);
            var base = tinycolor.fromRatio({h: hue, s: 1, v: 1}).toHexString();

            self.set({
                h: hue,
                base,
            });
        }

        if(self._slMousedown) {

            var saturation = clamp((self._lastMouseX - self._slRect.left) / self._slRect.width, 0, 1);
            var lightness  = clamp(1 - ((self._lastMouseY - self._slRect.top) / self._slRect.height), 0, 1);

            self.set({
                s: saturation,
                l: lightness
            });
        }

        if(self._opacityMousedown) {

           var a = clamp((self._lastMouseX - self._opacityRect.left) / self._opacityRect.width, 0, 1);

           self.set({
               a
           });

        }

        if(self._hueMousedown || self._slMousedown || self._opacityMousedown)
            requestAnimationFrame(self.boundUpdate)

    },

});

function clamp(val, min, max)
{
    return Math.max(Math.min(val, max), min);
}

function round(input) {
    return Math.round(input);
}

function isTouchDevice() {
    return 'ontouchstart' in win || 'onmsgesturechange' in win;
}
