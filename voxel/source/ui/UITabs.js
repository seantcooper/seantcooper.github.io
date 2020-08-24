class UITabs extends UIContainer {
    constructor() {
        super();
        this.tabs = new Dictionary();
        this.buttonPanel = new UIFlowContainer();
        this.addControl(this.buttonPanel);
        this.addControl(new UISpacer()); //.init({ bgcolor: uicss.selectedColor }));
    }

    set tabSquare(a) { this.buttonPanel.square = a; }
    get tabSquare() { return this.buttonPanel.square; }
    set tabHeight(a) { this.buttonPanel.size = new Size(this.buttonPanel.size.width, a); }
    get tabHeight() { return this.buttonPanel.size.height; }
    set tabWidth(a) {
        this._tabWidth = a;
        for (var tab of this.tabs.values)
            tab.button.size = new Size(a, 1);
    }
    get tabWidth() { return this._tabWidth; }

    addTab(name, panel) {
        name = name.toString();
        var _select = (function (e) { this.selectPanel(e.target.text.toLowerCase()); }).bind(this);

        var tab = {};
        tab.name = name.toLowerCase();
        tab.user = {};
        tab.buttonGroup = this.tabs.length ? this.tabs.values[0].buttonGroup : [];
        tab.buttonGroup.push(tab.button = new UIListButton(name, tab.buttonGroup).init({ bgcolor: uicss.bgcolor }));
        panel && (tab.panel = panel.init({ visible: false, margin: 0 }));

        tab.button.events.add("deselected", this._deselectTab.bind(this));
        tab.button.events.add("selected", this._selectTab.bind(this));
        this._tabWidth && (tab.button.size = new Size(this.tabWidth, 1));
        tab.button.name = name;
        this.buttonPanel.addControl(tab.button);
        tab.panel && (this.addControl(tab.panel));
        this.tabs.add(tab.name, tab);

        // var w = this.tabSquare ? uicss.ratio * this.tabHeight : Math.max(uicss.ratio * this.tabHeight, 1 / this.tabs.length);
        // for (var _tab of this.tabs.values) _tab.button.size = new Size(w, this.tabHeight);
        return tab;
    }

    _selectTab(e) {
        this.selectedButton = e.target;
        this.selectedTab = this.tabs[this.selectedButton.name.toLowerCase()];
        this.selectedPanel = this.selectedTab.panel;
        this.selectedPanel && (this.selectedPanel.visible = true);
        this.events.raise("selected");
    }
    _deselectTab(e) {
        var tab = this.tabs[e.target.name.toLowerCase()];
        tab.panel && (tab.panel.visible = false);
    }

    addImageTab(name, image, panel) {
        var tab = this.addTab(name, panel);
        tab.button.text = "";
        tab.button.image = image;
        return tab;
    }

    getPanel(name) { return this.tabs[name].panel; }
    getTab(name) { return this.tabs[name]; }
    selectTab(name) { this.tabs[name].button.select(); }

    get panels() { return this.tabs.values.select(function (p) { return p.panel; }); }
}