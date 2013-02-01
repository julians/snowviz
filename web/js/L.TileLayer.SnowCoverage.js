L.TileLayer.SnowCoverage = L.TileLayer.Canvas.extend({
	options: {
        color: '#fff',
        opacity: 1,
        debug: false,
		rectSize: 0.005
	},

	initialize: function (options, data) {
        var self = this;
        L.Util.setOptions(this, options);

        this.drawTile = function (tile, tilePoint, zoom) {
            var ctx = {
                canvas: tile,
                tilePoint: tilePoint,
                zoom: zoom
            };

            if (self.options.debug) {
                self._drawDebugInfo(ctx);
            }
            this._draw(ctx);
        };
    },

    _drawDebugInfo: function (ctx) {
        var max = this.tileSize;
        var g = ctx.canvas.getContext('2d');
        g.globalCompositeOperation = 'destination-over';
        g.strokeStyle = '#000000';
        g.fillStyle = '#FFFF00';
        g.strokeRect(0, 0, max, max);
        g.font = "12px Arial";
        g.fillRect(0, 0, 5, 5);
        g.fillRect(0, max - 5, 5, 5);
        g.fillRect(max - 5, 0, 5, 5);
        g.fillRect(max - 5, max - 5, 5, 5);
        g.fillRect(max / 2 - 5, max / 2 - 5, 10, 10);
        g.strokeText(ctx.tilePoint.x + ' ' + ctx.tilePoint.y + ' ' + ctx.zoom, max / 2 - 30, max / 2 - 10);
    },

    _createTile: function () {
        var tile = this._canvasProto.cloneNode(false);
        tile.onselectstart = tile.onmousemove = L.Util.falseFn;
        return tile;
    },

    setData: function(dataset) {
        var self = this;

        this.bounds = new L.LatLngBounds(dataset);

        this._quad = new QuadTree(this._boundsToQuery(this.bounds), false, 6, 6);

        dataset.forEach(function(d) {
            self._quad.insert({
                x: d[1], //lng
                y: d[0], //lat
				v: d[2]
            });
        });
        this.redraw();
    },

    _tilePoint: function (ctx, coords) {
        // start coords to tile 'space'
        var s = ctx.tilePoint.multiplyBy(this.options.tileSize);

        // actual coords to tile 'space'
        var p = this._map.project(new L.LatLng(coords[0], coords[1]));

        // point to draw
        var x = Math.round(p.x - s.x);
        var y = Math.round(p.y - s.y);
        return [x, y];
    },

    _drawPoints: function (ctx, coordinates) {
        var c = ctx.canvas,
            g = c.getContext('2d'),
            self = this,
            p;
        coordinates.forEach(function(coords){
			g.fillStyle = "rgba(255, 255, 255,"+coords[2]+")";
            p = self._tilePoint(ctx, coords);
            p2 = self._tilePoint(ctx, [coords[0]+self.options.rectSize, coords[1]+self.options.rectSize]);
            g.beginPath();
            g.rect(p[0], p[1], p2[0]-p[0], p2[1]-p[1]);
            g.fill();
        });
    },

    _boundsToQuery: function(bounds) {
        return {
            x: bounds.getSouthWest().lng,
            y: bounds.getSouthWest().lat,
            width: bounds.getNorthEast().lng-bounds.getSouthWest().lng,
            height: bounds.getNorthEast().lat-bounds.getSouthWest().lat
        };
    },

    _draw: function (ctx) {
        if (!this._quad || !this._map) {
            return;
        }

        var tileSize = this.options.tileSize;
		
		// get the corner points for this tile (in pixels)
        var nwPoint = ctx.tilePoint.multiplyBy(tileSize);
        var sePoint = nwPoint.add(new L.Point(tileSize, tileSize));
		// convert them to lat long
		nwPoint = this._map.unproject(nwPoint);
		sePoint = this._map.unproject(sePoint);
		// create a lat long bounds rect from them and look how big it is
        var bounds = new L.LatLngBounds(sePoint, nwPoint);
		var distance = nwPoint.distanceTo(bounds.getNorthEast());
		// create a lat long bounds rect from the snow rects,
		// look how big it is and add some padding to the bounds for this tile
		// because we need to also draw snow rects that are only partially on this tile,
		// otherwise we’d have ugly gaps
		var paddingBounds = new L.LatLngBounds([0, 0], [this.options.rectSize, this.options.rectSize]);
		var paddingDistance = paddingBounds.getNorthWest().distanceTo(paddingBounds.getNorthEast());
		bounds = bounds.pad(paddingDistance/distance);
		
        var coordinates = [];
        this._quad.retrieveInBounds(this._boundsToQuery(bounds)).forEach(function(obj) {
            coordinates.push([obj.y, obj.x, obj.v]);
        });

        this._drawPoints(ctx, coordinates);

        var c = ctx.canvas;
        var g = c.getContext('2d');
    }
});

L.TileLayer.snowCoverage = function (options) {
    return new L.TileLayer.SnowCoverage(options);
};