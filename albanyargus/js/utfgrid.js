function corslite(t,e,i){function o(t){return t>=200&&t<300||304===t}function n(){void 0===a.status||o(a.status)?e.call(a,null,a):e.call(a,a,null)}var l=!1;if("undefined"==typeof window.XMLHttpRequest)return e(Error("Browser not supported"));if("undefined"==typeof i){var s=t.match(/^\s*https?:\/\/[^\/]*/);i=s&&s[0]!==location.protocol+"//"+location.hostname+(location.port?":"+location.port:"")}var a=new window.XMLHttpRequest;if(i&&!("withCredentials"in a)){a=new window.XDomainRequest;var r=e;e=function(){if(l)r.apply(this,arguments);else{var t=this,e=arguments;setTimeout(function(){r.apply(t,e)},0)}}}return"onload"in a?a.onload=n:a.onreadystatechange=function(){4===a.readyState&&n()},a.onerror=function(t){e.call(this,t||!0,null),e=function(){}},a.onprogress=function(){},a.ontimeout=function(t){e.call(this,t,null),e=function(){}},a.onabort=function(t){e.call(this,t,null),e=function(){}},a.open("GET",t,!0),a.send(null),l=!0,a}"undefined"!=typeof module&&(module.exports=corslite),L.UTFGrid=L.TileLayer.extend({options:{resolution:4,pointerCursor:!0,mouseInterval:66},_mouseOn:null,_mouseOnTile:null,_tileCharCode:null,_cache:null,_idIndex:null,_throttleMove:null,_updateCursor:function(){},onAdd:function(t){this._cache={},this._idIndex={},L.TileLayer.prototype.onAdd.call(this,t),this._throttleMove=L.Util.throttle(this._move,this.options.mouseInterval,this),this.options.pointerCursor&&(this._updateCursor=function(t){this._container.style.cursor=t}),t.on("boxzoomstart",this._disconnectMapEventHandlers,this),t.on("boxzoomend",this._throttleConnectEventHandlers,this),this._connectMapEventHandlers()},onRemove:function(){var t=this._map;t.off("boxzoomstart",this._disconnectMapEventHandlers,this),t.off("boxzoomend",this._throttleConnectEventHandlers,this),this._disconnectMapEventHandlers(),this._updateCursor(""),L.TileLayer.prototype.onRemove.call(this,t)},createTile:function(t){return this._loadTile(t),document.createElement("div")},_connectMapEventHandlers:function(){this._map.on("click",this._onClick,this),this._map.on("mousemove",this._throttleMove,this)},_disconnectMapEventHandlers:function(){this._map.off("click",this._onClick,this),this._map.off("mousemove",this._throttleMove,this)},_throttleConnectEventHandlers:function(){setTimeout(this._connectMapEventHandlers.bind(this),100)},_update:function(t,e){L.TileLayer.prototype._update.call(this,t,e)},_loadTile:function(t){var e=this.getTileUrl(t),i=this._tileCoordsToKey(t),o=this;this._cache[i]||corslite(e,function(t,e){if(t)return void o.fire("error",{error:t});var n=JSON.parse(e.responseText);o._cache[i]=n,L.Util.bind(o._handleTileLoad,o)(i,n)},!0)},_handleTileLoad:function(t,e){},_onClick:function(t){this.fire("click",this._objectForEvent(t))},_move:function(t){if(null!=t.latlng){var e=this._objectForEvent(t);e._tileCharCode!==this._tileCharCode?(this._mouseOn&&(this.fire("mouseout",{latlng:t.latlng,data:this._mouseOn,_tile:this._mouseOnTile,_tileCharCode:this._tileCharCode}),this._updateCursor("")),e.data&&(this.fire("mouseover",e),this._updateCursor("pointer")),this._mouseOn=e.data,this._mouseOnTile=e._tile,this._tileCharCode=e._tileCharCode):e.data&&this.fire("mousemove",e)}},_objectForEvent:function(t){if(t.latlng){var e=this._map,i=e.project(t.latlng),o=this.options.tileSize,n=this.options.resolution,l=Math.floor(i.x/o),s=Math.floor(i.y/o),a=Math.floor((i.x-l*o)/n),r=Math.floor((i.y-s*o)/n),h=e.options.crs.scale(e.getZoom())/o;l=(l+h)%h,s=(s+h)%h;var d=this._tileCoordsToKey({z:e.getZoom(),x:l,y:s}),u=this._cache[d];if(!u)return{latlng:t.latlng,data:null,_tile:null,_tileCharCode:null};var c=u.grid[r].charCodeAt(a),_=this._utfDecode(c),f=u.keys[_],p=u.data[f];return u.data.hasOwnProperty(f)||(p=null),{latlng:t.latlng,data:p,id:p?p.id:null,_tile:d,_tileCharCode:d+":"+c}}},_dataForCharCode:function(t,e){var i=this._cache[t],o=this._utfDecode(e),n=i.keys[o],l=i.data[n];return i.data.hasOwnProperty(n)||(l=null),l},_utfDecode:function(t){return t>=93&&t--,t>=35&&t--,t-32},_utfEncode:function(t){var e=t+32;return e>=34&&e++,e>=92&&e++,e}}),L.utfGrid=function(t,e){return new L.UTFGrid(t,e)},L.UTFGridCanvas=L.UTFGrid.extend({options:{idField:"ID",buildIndex:!0,fillColor:"black",shadowBlur:0,shadowColor:null,debug:!1},_adjacentTiles:null,onAdd:function(t){this._adjacentTiles=[],L.UTFGrid.prototype.onAdd.call(this,t)},createTile:function(t){this._loadTile(t);var e=document.createElement("canvas");return e.width=e.height=this.options.tileSize,this.options.debug&&this._drawDefaultTile(e.getContext("2d"),this._tileCoordsToKey(t)),e},_connectMapEventHandlers:function(){L.UTFGrid.prototype._connectMapEventHandlers.call(this),this.on("mouseover",this._handleMouseOver,this),this.on("mouseout",this._handleMouseOut,this)},_disconnectMapEventHandlers:function(){L.UTFGrid.prototype._disconnectMapEventHandlers.call(this),this.off("mouseover",this._handleMouseOver,this),this.off("mouseout",this._handleMouseOut,this)},_handleMouseOver:function(t){if(null!=t._tile&&null!=t._tileCharCode){this._clearAdjacentTiles();var e=t._tile;if(this._drawTile(e,parseInt(t._tileCharCode.split(":")[3])),t.data&&this._idIndex){var i=t.data[this.options.idField],o=e.split(":")[2];if(!(i&&this._idIndex[i]&&this._idIndex[i][o]))return;var n=this._idIndex[i][o];for(var l in n)l!==e&&(this._drawTile(l,n[l]),this._adjacentTiles.push(l))}}},_handleMouseOut:function(t){this._resetTile(t._tile),this._clearAdjacentTiles()},_clearAdjacentTiles:function(){if(this._adjacentTiles){for(var t=0;t<this._adjacentTiles.length;t++)this._resetTile(this._adjacentTiles[t]);this._adjacentTiles=[]}},_handleTileLoad:function(t,e){if(this.options.buildIndex)for(var i,o,n,l=this.options.idField,s=t.split(":")[2],a=0;a<e.keys.length;a++)o=e.data[e.keys[a]],o&&(i=o[l],i&&(null==this._idIndex[i]&&(this._idIndex[i]={}),n=this._idIndex[i],null==n[s]&&(n[s]={}),n[s][t]=this._utfEncode(a)))},_drawTile:function(t,e){if(null!=this._tiles[t]){var i=this._tiles[t].el,o=i.getContext("2d");this._resetTile(t);var n=this._cache[t].grid;o.fillStyle=this.options.fillColor;for(var l=this.options.tileSize/this.options.resolution,s=0;s<l;s++)for(var a=0;a<l;a++)if(n[a].charCodeAt(s)===e){for(var r=1;a<63&&n[a+1].charCodeAt(s)===e;)a++,r++;o.fillRect(4*s,4*a-4*(r-1),4,4*r)}this.options.shadowBlur&&this._addShadow(i,o)}},_resetTile:function(t){if(null!=this._tiles[t]){var e=this._tiles[t].el;e.width=this.options.tileSize,this.options.debug&&this._drawDefaultTile(e.getContext("2d"),t)}},_drawDefaultTile:function(t,e){t.fillStyle="black",t.fillText(e,20,20),t.strokeStyle="red",t.beginPath(),t.moveTo(0,0),t.lineTo(255,0),t.lineTo(255,255),t.lineTo(0,255),t.closePath(),t.stroke()},_addShadow:function(t,e){e.shadowBlur=this.options.shadowBlur,e.shadowColor=this.options.shadowColor||this.options.fillColor,e.globalAlpha=.7,e.globalCompositeOperation="lighter";var i=1;e.drawImage(t,-i,-i),e.drawImage(t,i,i),e.drawImage(t,0,-i),e.drawImage(t,-i,0),e.globalAlpha=1}}),L.utfGridCanvas=function(t,e){return new L.UTFGridCanvas(t,e)};
