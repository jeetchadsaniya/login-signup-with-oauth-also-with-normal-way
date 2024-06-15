class Router{
    constructor(){
        this._getRoutes = {};
        this._postRoutes = {};
        this._putRoutes = {};
        this._deleteRoutes = {};
    }
    getRoutes(url,controller,midddleware = []){
        this._getRoutes[url] = [...midddleware,controller];
    }
    postRoutes(url,controller,midddleware = []){
        this._postRoutes[url] = [...midddleware,controller];
    }
    putRoutes(url,controller,midddleware = []){
        this._putRoutes[url] = [...midddleware,controller];
    }
    deleteRoutes(url,controller,midddleware = []){
        this._deleteRoutes[url] = [...midddleware,controller];
    }
}

module.exports = {
    Router
}