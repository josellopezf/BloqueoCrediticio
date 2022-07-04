sap.ui.define([
		"sap/ui/core/mvc/Controller",
        "sap/m/Dialog",
        "sap/ui/table/Table",
        "SCO/BTP/bloqueocrediticio_html/utils/utils",
        "SCO/BTP/bloqueocrediticio_html/model/models",
        "SCO/BTP/bloqueocrediticio_html/utils/validator"        
	],
	/**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     * @param {typeof sap.m.Dialog} Dialog
     * @param {typeof sap.ui.table.Table} Table
     */
	function (Controller, Dialog, Table, utils, models, Validator) {
		"use strict";

		return Controller.extend("SCO.BTP.bloqueocrediticio_html.controller.View1", {

            handleSearch: function () {
                let model = this.getView().getModel();
                let that = this;
    
                model.setProperty('/VisibleResultado',false);
    
                let validator = new Validator();
                let valid = validator.validate(this.byId("filters"));
                if (valid) {
                    let sociedades = model.getProperty('/Sociedades');
                    let sociedad = sociedades.find(function(s){return s.BUKRS == model.getProperty('/filters/i_Sociedad')});
                    let rut = model.getProperty('/filters/Cliente');
                        //Datos cliente
                        let oFilters = {
                            BUKRS: '',
                            VKORG: '',
                            KUNNR: rut
                        };
/*Jose Lopez    
                        utils.httpCall({
                            service: "ZPWD_072_SD_INFOBASICA",
                            query: oFilters,
                            type: "post",
                            success: function (result, status, xhr) {
                                model.setProperty('/DatosCliente', result);
                                if (result.T_RETURN.filter(function (r) {
                                        return r.TYPE === 'S'
                                    }).length > 0 || result.T_RETURN.length === 0) {
                                                that._loadControlCredito();
                                } else {
                                    result.T_RETURN.forEach(function (r) {
                                        sap.ui.getCore().getMessageManager().removeAllMessages();
                                        that.addMessage(r.MESSAGE, r.TYPE);
                                    });
                                }
                            }
                        });
Jose Lopez*/
                        var oScoModel = new sap.ui.model.json.JSONModel();
                        oScoModel.loadData("model/data3.json");
                        oScoModel.attachRequestCompleted(function(oEvent) {
                            var t_dataclient = oScoModel.getProperty("/ZPWD_072_SD_INFOBASICA/response");
                            model.setProperty('/DatosCliente',t_dataclient);
                            if (t_dataclient.T_RETURN.filter(function (r) {
                                return r.TYPE === 'S'
                                }).length > 0 || t_dataclient.T_RETURN.length === 0) {
                                        that._loadControlCredito();
                            } else {
                                t_dataclient.T_RETURN.forEach(function (r) {
                                    sap.ui.getCore().getMessageManager().removeAllMessages();
                                    that.addMessage(r.MESSAGE, r.TYPE);
                                });
                            }
                        });
                }
            },

            handlelockChanged: function (oEvent) {
                let model = this.getView().getModel();
                let that = this;
                let bloqueo = model.getProperty('/AntecedentesFinancieros/ControlCreditos/E_KNKK/CRBLB');
                
                var check = oEvent.getParameter("selected");
                if (check){
                    model.setProperty('/AntecedentesFinancieros/ControlCreditos/E_KNKK/CRBLB','X');
                         }else{
                           model.setProperty('/AntecedentesFinancieros/ControlCreditos/E_KNKK/CRBLB','');
                         }
            },
        
            handleGuardar: function () {
                let model = this.getView().getModel();
                let that = this;
                let rut = model.getProperty('/filters/Cliente');
                let AreaCC = model.getProperty('/filters/ACC');
                let bloqueo = model.getProperty('/AntecedentesFinancieros/ControlCreditos/E_KNKK/CRBLB')
                let oFilters = {
                    I_KKBER:AreaCC,
                    I_KUNNR:rut,
                    I_CRBLB:bloqueo
                    };
/* Jose Lopez        
                    utils.httpCall({
                        service : "ZSD_FM_CHANGE_LOCK",
                        query : oFilters,
                        type : "post",
                        success : function (result, status, xhr) {
                        //	that._loadControlCredito();
                            sap.ui.getCore().getMessageManager().removeAllMessages();
                            that.addMessage(result.I_RETURN.MESSAGE, result.I_RETURN.TYPE);
                            
                        }
                    });
Jose Lopez               */      
                    var oScoModel = new sap.ui.model.json.JSONModel();
                    oScoModel.loadData("model/data3.json");
                    oScoModel.attachRequestCompleted(function(oEvent) {
                        var t_datempr = oScoModel.getProperty("/ZSD_FM_CHANGE_LOCK/response");
                        that._loadControlCredito();
                        sap.ui.getCore().getMessageManager().removeAllMessages();
                        that.addMessage(t_datempr.I_RETURN.MESSAGE, t_datempr.I_RETURN.TYPE);
                    });

            },
        
            _dateFormat(value){
                let dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
                    pattern: "dd/MM/yyyy",
                    source: { pattern: "yyyy-MM-dd" }
                });
    
                if(value != '' && value != null){
                    return dateFormat.format(dateFormat.parse(value));
                }else{
                    return value;
                }
            },
        
            _numberFormat(value){
                let numberFormat = sap.ui.core.format.NumberFormat.getIntegerInstance({
                    groupingEnabled:true
                });
    
                if(value != '' && value != null){
                    return numberFormat.format(Math.round(value));
                }else{
                    return value;
                }
            },
        
            _openVentanaDetalles: function(ventana){
    
                let model =  this.getView().getModel();
                let titulos = [];
                let columnas = [];
                let rut = model.getProperty('/DatosCliente/T_KNA1/KUNNR');
            },            

            /**
             * Generic dialog function
             */
            openDialog: function (fragment, result) {
                let model = this.getView().getModel();
                let oView = this.getView();
                for (var i = 0; this['openedDialog' + i] && !this['openedDialog' + i].bIsDestroyed; i++) ;
                let dialog = 'openedDialog' + i;
                model.setProperty("/" + dialog, result || {});

                this[dialog] = sap.ui.xmlfragment(oView.getId(), "SCO.BTP.bloqueocrediticio_html.view." + fragment, this);
                oView.addDependent(this[dialog]);
                this[dialog].bindElement("/" + dialog);

                //Cargo modelo limpio
                if (this['clearDialogModel_' + fragment])
                    this['clearDialogModel_' + fragment]();

                this[dialog].open();
            },
            closeDialog: function () {
                for (var i = 0; this['openedDialog' + i] && !this['openedDialog' + i].bIsDestroyed; i++) ;
                let dialog = 'openedDialog' + (i - 1);
                this[dialog].close();
                this[dialog].destroy();
            },
            getCurrentDialogModel: function () {
                for (var i = 0; this['openedDialog' + i] && !this['openedDialog' + i].bIsDestroyed; i++) ;
                return 'openedDialog' + (i - 1);
            },
            clearDialogModel_: function (cleanModel) {
                let model = this.getView().getModel();
                model.setProperty('/' + this.getCurrentDialogModel(), cleanModel)
            },
            getFromCurrentDialog: function (path) {
                let model = this.getView().getModel();
                return model.getProperty(`/${this.getCurrentDialogModel()}/${path}`);
            },
            setToCurrentDialog: function (path, data) {
                let model = this.getView().getModel();
                return model.setProperty(`/${this.getCurrentDialogModel()}/${path}`, data);
            },            
    
            getAppParam: function (param, defaultVal) {
                let ownerComponent = this.getOwnerComponent();
                let oComponentData = ownerComponent.getComponentData();
                let val = defaultVal;

                if (oComponentData && oComponentData.startupParameters[param] && oComponentData.startupParameters[param]) {
                    val = oComponentData.startupParameters[param][0];
                } else {
                    try {
                        let sParametros = window.location.href.split(param + "=");
                        val = sParametros[1].split("&")[0];
                    } catch (ex) {
                    }
                }
                return val;
            },

            _basicInit: function () {
                let model = models.createLocalModel();
                let view = this.getView();
                model.setProperty('/filters', {});
                view.setModel(model);
                utils.view = view;
                utils.controller = this;
    
                let desde = new Date();
                desde.setMonth(desde.getMonth()-6);
                let hasta = new Date();
    
                model.setProperty('/filters/Desde',(desde.getMonth()+1)+'/'+desde.getFullYear());
                model.setProperty('/filters/Hasta',(hasta.getMonth()+1)+'/'+hasta.getFullYear());
    
                this._iniciarCampos();
    
                var rut = this.getAppParam("rut");
                if (rut) {
                    model.setProperty('/filters/Cliente', rut);
                }
    
                this._oMessagePopover = new sap.m.MessagePopover({
                    items: {
                        path: "message>/",
                        template: new sap.m.MessageItem({
                            description: "{message>description}",
                            type: "{message>type}",
                            title: "{message>message}"
                        })
                    }
                });
                this.getView().addDependent(this._oMessagePopover);
            },

			onInit: function () {
                this._basicInit();
			},

            handleSelectCliente: function (evt) {
                let oModel = this.getView().getModel();
                oModel.setProperty('/filters/msValue', undefined);
                oModel.setProperty('/filters/msSelectedIndex', undefined);
                let rut = (typeof oModel.getProperty('/filters/Cliente') == 'undefined'?'':oModel.getProperty('/filters/Cliente'));
                oModel.setProperty("/BusquedaClientes",{Rut:rut,Nombre:'',Clientes:[],Selected:0});
    
    
                if (this.multiSelect) {
                    this.multiSelect.destroy()
                }

                this.multiSelect = new Dialog({
                    contentWidth: "800px",
                    title: 'Búsqueda de clientes',
                    content: new Table({
                        rows: '{/BusquedaClientes/Clientes}',
                        selectedIndex: '{/BusquedaClientes/Selected}',
                        visibleRowCount: 5,
                        noData: 'Cliente no encontrado.',
                        toolbar: new sap.m.Toolbar({
                            content: [
                                new sap.m.Label({
                                    text: 'RUT: '
                                }),   
                                new sap.m.Input({
                                    value: '{/BusquedaClientes/Rut}',
                                    width: '10rem',
                                    submit: () => this.handleSearchCliente(),
                                }),
                                new sap.m.Label({
                                    text: 'Nombre: '
                                }),
                                new sap.m.Input({
                                    value: '{/BusquedaClientes/Nombre}',
                                    width: '10rem',
                                    valueLiveUpdate:true,
                                    liveChange: function(evt){
                                        oModel.setProperty('/BusquedaClientes/Nombre',evt.getParameters().value.toUpperCase());
                                    },
                                    submit: () => this.handleSearchCliente(),
                                }),
                                new sap.m.ToolbarSpacer(),
                                new sap.m.Button({
                                    icon: "sap-icon://search",
                                    text: "Buscar",
                                    press: () => this.handleSearchCliente(),
                                })
                            ]                         
                        }),
                        selectionMode: "Single",
                        selectionBehavior: "Row",
                        columns: [
                            new sap.ui.table.Column({
                                label: new sap.m.Label({
                                    text: "Cliente"
                                }),
                                autoResizable:true,
                                template: new sap.m.Text({
                                    text: '{KUNNR}',
                                    wrapping:false
                                })
                            }),
                        new sap.ui.table.Column({
                            label: new sap.m.Label({
                                text: "Nombre 1"
                            }),
                            autoResizable:true,
                            template: new sap.m.Text({
                                text: '{NAME1}',
                                wrapping:false
                            })
                        }),
                        new sap.ui.table.Column({
                            label: new sap.m.Label({
                                text: "Nombre 2"
                            }),
                            autoResizable:true,
                            template: new sap.m.Text({
                                text: '{NAME2}',
                                wrapping:false
                            })
                        }),
                        new sap.ui.table.Column({
                            label: new sap.m.Label({
                                text: "Dirección"
                            }),
                            autoResizable:true,
                            template: new sap.m.Text({
                                text: '{STRAS}',
                                wrapping:false
                            })
                        }),
                        new sap.ui.table.Column({
                            label: new sap.m.Label({
                                text: "Teléfono 1"
                            }),
                            autoResizable:true,
                            template: new sap.m.Text({
                                text: '{TELF1}',
                                wrapping:false
                            })
                        }),
                        new sap.ui.table.Column({
                            label: new sap.m.Label({
                                text: "Teléfono 2"
                            }),
                            autoResizable:true,
                            template: new sap.m.Text({
                                text: '{TELF2}',
                                wrapping:false
                            })
                        })

                        ]
                    }).setModel(oModel),
                    beginButton: new sap.m.Button({
                        text: 'Seleccionar',
                        icon: 'sap-icon://accept',
                        press: () => {
                            this.handleClienteSet();
                        }
                    }),
                    endButton: new sap.m.Button({
                        text: 'Cancelar',
                        icon: 'sap-icon://decline',
                        press: () => {
                            this.multiSelect.close();
                        }
                    })

                }).addStyleClass('sapUiSizeCompact sapUiContentPadding');;
/*Jose Lopez                
                this.multiSelect = new sap.m.Dialog({
                    contentWidth: '800px',
                    title: 'Búsqueda de clientes',
                    content: new sap.ui.table.Table({
                        rows: '{/BusquedaClientes/Clientes}',
                        selectedIndex: '{/BusquedaClientes/Selected}',
                        visibleRowCount: 5,
                        noData: 'Cliente no encontrado.',
                        toolbar: new sap.m.Toolbar({
                            content: [
                                new sap.m.Label({
                                    text: 'RUT: '
                                }),
                                new sap.m.Input({
                                    value: '{/BusquedaClientes/Rut}',
                                    width: '10rem',
                                    submit: () => this.handleSearchCliente(),
                                }),
                                new sap.m.Label({
                                    text: 'Nombre: '
                                }),
                                new sap.m.Input({
                                    value: '{/BusquedaClientes/Nombre}',
                                    width: '10rem',
                                    valueLiveUpdate:true,
                                    liveChange: function(evt){
                                        oModel.setProperty('/BusquedaClientes/Nombre',evt.getParameters().value.toUpperCase());
                                    },
                                    submit: () => this.handleSearchCliente(),
                                }),
                                new sap.m.ToolbarSpacer(),
                                new sap.m.Button({
                                    icon: "sap-icon://search",
                                    text: "Buscar",
                                    press: () => this.handleSearchCliente(),
                                })
                            ]
                        }),
                        selectionMode: "Single",
                        selectionBehavior: "Row",
                        columns: [
                            new sap.ui.table.Column({
                                label: new sap.m.Label({
                                    text: "Cliente"
                                }),
                                autoResizable:true,
                                template: new sap.m.Text({
                                    text: '{KUNNR}',
                                    wrapping:false
                                })
                            }),
                            new sap.ui.table.Column({
                                label: new sap.m.Label({
                                    text: "Nombre 1"
                                }),
                                autoResizable:true,
                                template: new sap.m.Text({
                                    text: '{NAME1}',
                                    wrapping:false
                                })
                            }),
                            new sap.ui.table.Column({
                                label: new sap.m.Label({
                                    text: "Nombre 2"
                                }),
                                autoResizable:true,
                                template: new sap.m.Text({
                                    text: '{NAME2}',
                                    wrapping:false
                                })
                            }),
                            new sap.ui.table.Column({
                                label: new sap.m.Label({
                                    text: "Dirección"
                                }),
                                autoResizable:true,
                                template: new sap.m.Text({
                                    text: '{STRAS}',
                                    wrapping:false
                                })
                            }),
                            new sap.ui.table.Column({
                                label: new sap.m.Label({
                                    text: "Teléfono 1"
                                }),
                                autoResizable:true,
                                template: new sap.m.Text({
                                    text: '{TELF1}',
                                    wrapping:false
                                })
                            }),
                            new sap.ui.table.Column({
                                label: new sap.m.Label({
                                    text: "Teléfono 2"
                                }),
                                autoResizable:true,
                                template: new sap.m.Text({
                                    text: '{TELF2}',
                                    wrapping:false
                                })
                            })
                        ],
                    }).setModel(oModel),
                    beginButton: new sap.m.Button({
                        text: 'Seleccionar',
                        icon: 'sap-icon://accept',
                        press: () => {
                            this.handleClienteSet();
                        }
                    }),
                    endButton: new sap.m.Button({
                        text: 'Cancelar',
                        icon: 'sap-icon://decline',
                        press: () => {
                            this.multiSelect.close();
                        }
                    })
                }).addStyleClass('sapUiSizeCompact sapUiContentPadding');
Jose Lopez*/                
                this.multiSelect.open();
            },

            handleSearchCliente: function(evt){
                let that = this;
                var oModel = this.getView().getModel();
                var rut = oModel.getProperty('/BusquedaClientes/Rut');
                var nombre = oModel.getProperty('/BusquedaClientes/Nombre');
    
                if(rut != '' || nombre != '') {
                    this.multiSelect.setBusy(true);
    
                    oModel.setProperty('/BusquedaClientes/Clientes', []);
                    var oFilters = {
                        I_CLIENTE: rut,
                        I_NOMBRE: nombre
                    };
/*Jose Lopez    
                    utils.httpCall({
                        service: "ZPWD_020_BUSCACLIENTE",
                        query: oFilters,
                        type: "post",
                        success: function (result, status, xhr) {
                            if (result.T_RETORNO[0].TYPE == "S") {
                                oModel.setProperty('/BusquedaClientes/Clientes', result.T_CLIENTE);
                            }
                        }
                    }).always(function () {
                        that.multiSelect.setBusy(false);
                    });                    
Jose Lopez*/           
                    var oScoModel = new sap.ui.model.json.JSONModel();
                    oScoModel.loadData("model/data2.json");
                    oScoModel.attachRequestCompleted(function(oEvent) {
                        var t_datempr = oScoModel.getProperty("/ZPWD_020_BUSCACLIENTE/response/T_CLIENTE");
                        oModel.setProperty('/BusquedaClientes/Clientes',t_datempr);
                        that.multiSelect.setBusy(false);
                    });

                }else{
                    sap.ui.getCore().getMessageManager().removeAllMessages();
    
                    this.addMessage('Debe ingresar algun criterio de búsqueda.','E');
                }
            },
    
            handleClienteSet: function(evt){
                var oModel = this.getView().getModel();
                let index = oModel.getProperty('/BusquedaClientes/Selected');
                if(parseInt(index) >= 0){
                    let clientes = oModel.getProperty('/BusquedaClientes/Clientes');
                    let cliente = clientes[index].KUNNR;
                    oModel.setProperty('/filters/Cliente',cliente);
                    oModel.setProperty("/ClienteState",null);
                    oModel.setProperty("/ClienteStateText",null);
                    this.multiSelect.close();
                }
            },
    
            _openDetailsDialog: function (windowTitle,indice,titulos,columnas) {
                let oModel = this.getView().getModel();
    
                if (this.detailsDialog) {
                    this.detailsDialog.destroy()
                }
    
                let columns = [];
                for(var i=0; i<titulos.length;i++){
                    columns.push(new sap.ui.table.Column({
                        label: new sap.m.Label({
                            text: titulos[i]
                        }),
                        template: new sap.m.Text({
                            text: columnas[i],
                            wrapping:false
                        }),
                        autoResizable: true
                    }));
                }
    
                let table = new sap.ui.table.Table({
                    rows: '{/AntecedentesComerciales/Detalles/'+indice+'}',
                    visibleRowCount: 10,
                    noData: 'Sin Detalles.',
                    selectionMode: "None",
                    columns: columns,
                });
    
                this.detailsDialog = new sap.m.Dialog({
                    contentWidth: '800px',
                    title: windowTitle || 'Detalles',
                    content: table.setModel(oModel),
                    endButton: new sap.m.Button({
                        text: 'Cerrar',
                        icon: 'sap-icon://decline',
                        press: () => {
                            this.detailsDialog.close();
                        }
                    })
                }).addStyleClass('sapUiSizeCompact sapUiContentPadding');
    
                this.detailsDialog.open();
                for(var i=0; i<titulos.length;i++){
                    table.autoResizeColumn(i);
                }
            },
    
            handleCreditoClienteDetail(){
                this._openDescriptionDialog('CreditoCliente','Grupo Crédito Cliente','Descripción');
            },
    
            handleEquipoResponsableDetail(){
                this._openDescriptionDialog('EquipoResponsable','Equipo Responsable','Descripción');
            },
    
            handleCondicionPagoDetail(){
                this._openDescriptionDialog('CondicionPago','Condición de Pago','Descripción');
            },
    
            _openDescriptionDialog: function (indice,tituloCodigo,tituloDescripcion) {
                let oModel = this.getView().getModel();
    
                if (this.descriptionDialog) {
                    this.descriptionDialog.destroy()
                }
    
                this.descriptionDialog = new sap.m.Dialog({
                    contentWidth: '600px',
                    title: 'Descripciones',
                    content: new sap.ui.table.Table({
                        rows: '{/AntecedentesFinancieros/Descripciones/'+indice+'}',
                        visibleRowCount: 5,
                        noData: 'Sin Descripciones.',
                        selectionMode: "None",
                        columns: [
                            new sap.ui.table.Column({
                                label: new sap.m.Label({
                                    text: tituloCodigo
                                }),
                                template: new sap.m.Text({
                                    text: '{CODIGO}',
                                    wrapping:false
                                })
                            }),
                            new sap.ui.table.Column({
                                label: new sap.m.Label({
                                    text: tituloDescripcion
                                }),
                                template: new sap.m.Text({
                                    text: '{DESCRIPCION}',
                                    wrapping:false
                                })
                            })
                        ],
                    }).setModel(oModel),
                    endButton: new sap.m.Button({
                        text: 'Cerrar',
                        icon: 'sap-icon://decline',
                        press: () => {
                            this.descriptionDialog.close();
                        }
                    })
                }).addStyleClass('sapUiSizeCompact sapUiContentPadding');
                this.descriptionDialog.open();
            },
    
            handleAreaCCChange: function(evt){
                this._loadControlCredito();
            },
    
            //Atecedentes Financieros -> Control de Crédito
            _loadControlCredito: function(){
                let model = this.getView().getModel();
                let that = this;
                let sociedades = model.getProperty('/Sociedades');
                let sociedad = sociedades.find(function(s){return s.BUKRS == model.getProperty('/filters/i_Sociedad')});
                let rut = model.getProperty('/filters/Cliente');
    
                let AreaCC = model.getProperty('/filters/ACC');
    
                let oFilters = {
                    I_KKBER:AreaCC,
                    I_KUNNR:rut,
                    I_SPART:'',
                    I_VKORG:'',
                    I_VTWEG:''
                };
/*Jose Lopez    
                utils.httpCall({
                    service : "ZSD_FM_INFOFD33",
                    query : oFilters,
                    type : "post",
                    success : function (result, status, xhr) {
                        model.setProperty('/AntecedentesFinancieros/ControlCreditos',result);
                            if (result.GT_RETURN.filter(function (r) { return r.TYPE === 'S' }).length > 0 
                            ||  result.GT_RETURN.filter(function (r) { return r.TYPE === 'W' }).length > 0 
                            ||  result.GT_RETURN.length === 0) {
                                       model.setProperty('/VisibleResultado', true);
    
                        let creditoCliente = [];
                        let equipoResponsable = [];
                        let viasPago = [];
                        let viasPagoTooltip = [];
                        let condicionPago = [];
    
                        result.GT_T691T.forEach(function(cc){
                            creditoCliente.push({
                                CODIGO:cc.CTLPC,
                                DESCRIPCION:cc.RTEXT
                            });
                        });
    
                        result.GT_T024B.forEach(function(er){
                            equipoResponsable.push({
                                CODIGO:er.SBGRP,
                                DESCRIPCION:er.STEXT
                            });
                        });
    
                        result.GT_T042Z.forEach(function(vp){
                            viasPago.push({
                                CODIGO:vp.ZLSCH,
                                DESCRIPCION:vp.TEXT1
                            });
                        });
    
                        result.E_VIAS_PAGO.split('').forEach(function (v) {
                            let desc = viasPago.find(function(d){
                                return d.CODIGO == v;
                            });
                            viasPagoTooltip.push(desc.CODIGO + ' - '+ desc.DESCRIPCION);
                        });
    
                        result.GT_T052U.forEach(function(cp){
                            condicionPago.push({
                                CODIGO:cp.ZTERM,
                                DESCRIPCION:cp.TEXT1
                            });
                        });
    
                        model.setProperty('/AntecedentesFinancieros/Descripciones/CreditoCliente',creditoCliente);
                        model.setProperty('/AntecedentesFinancieros/Descripciones/EquipoResponsable',equipoResponsable);
                        model.setProperty('/AntecedentesFinancieros/Descripciones/ViasPago',viasPago);
                        model.setProperty('/AntecedentesFinancieros/Descripciones/ViasPagoTooltip',viasPagoTooltip.join("\n"));
                        model.setProperty('/AntecedentesFinancieros/Descripciones/CondicionPago',condicionPago);
                        
                        sap.ui.getCore().getMessageManager().removeAllMessages();
                            result.GT_RETURN.forEach(function (r) {
                                that.addMessage(r.MESSAGE, r.TYPE);
                         });
                            
                        } else {
                            sap.ui.getCore().getMessageManager().removeAllMessages();
                            result.GT_RETURN.forEach(function (r) {
                                that.addMessage(r.MESSAGE, r.TYPE);
                            });
                        }
                    }
                });
Jose Lopez*/
                var oScoModel = new sap.ui.model.json.JSONModel();
                oScoModel.loadData("model/data3.json");
                oScoModel.attachRequestCompleted(function(oEvent) {
                    var t_dataclient = oScoModel.getProperty("/ZSD_FM_INFOFD33/response");
                    model.setProperty('/AntecedentesFinancieros/ControlCreditos',t_dataclient);
                    if (t_dataclient.GT_RETURN.filter(function (r) { return r.TYPE === 'S' }).length > 0 
                    ||  t_dataclient.GT_RETURN.filter(function (r) { return r.TYPE === 'W' }).length > 0 
                    ||  t_dataclient.GT_RETURN.length === 0) {
                        model.setProperty('/VisibleResultado', true);

                        let creditoCliente = [];
                        let equipoResponsable = [];
                        let viasPago = [];
                        let viasPagoTooltip = [];
                        let condicionPago = [];

                        t_dataclient.GT_T691T.forEach(function(cc){
                            creditoCliente.push({
                                CODIGO:cc.CTLPC,
                                DESCRIPCION:cc.RTEXT
                            });
                        });

                        t_dataclient.GT_T024B.forEach(function(er){
                            equipoResponsable.push({
                                CODIGO:er.SBGRP,
                                DESCRIPCION:er.STEXT
                            });
                        });

                        t_dataclient.GT_T042Z.forEach(function(vp){
                            viasPago.push({
                                CODIGO:vp.ZLSCH,
                                DESCRIPCION:vp.TEXT1
                            });
                        });

                        t_dataclient.E_VIAS_PAGO.split('').forEach(function (v) {
                            let desc = viasPago.find(function(d){
                                return d.CODIGO == v;
                            });
                            viasPagoTooltip.push(desc.CODIGO + ' - '+ desc.DESCRIPCION);
                        });

                        t_dataclient.GT_T052U.forEach(function(cp){
                            condicionPago.push({
                                CODIGO:cp.ZTERM,
                                DESCRIPCION:cp.TEXT1
                            });
                        });

                        model.setProperty('/AntecedentesFinancieros/Descripciones/CreditoCliente',creditoCliente);
                        model.setProperty('/AntecedentesFinancieros/Descripciones/EquipoResponsable',equipoResponsable);
                        model.setProperty('/AntecedentesFinancieros/Descripciones/ViasPago',viasPago);
                        model.setProperty('/AntecedentesFinancieros/Descripciones/ViasPagoTooltip',viasPagoTooltip.join("\n"));
                        model.setProperty('/AntecedentesFinancieros/Descripciones/CondicionPago',condicionPago);
                        
//                        sap.ui.getCore().getMessageManager().removeAllMessages();
                        t_dataclient.GT_RETURN.forEach(function (r) {
                            that.addMessage(r.MESSAGE, r.TYPE);
                        });
                            
                        } else {
                            sap.ui.getCore().getMessageManager().removeAllMessages();
                            t_dataclient.GT_RETURN.forEach(function (r) {
                                that.addMessage(r.MESSAGE, r.TYPE);
                            });
                        }
                });

            },
    
            handleVencimientoChange: function(evt){
                this._loadDoctosMorosos();
            },
    
            _loadDoctosMorosos: function(){
                let model = this.getView().getModel();
                let sociedades = model.getProperty('/Sociedades');
                let sociedad = sociedades.find(function(s){return s.BUKRS == model.getProperty('/filters/i_Sociedad')});
                let rut = model.getProperty('/filters/Cliente');
    
                let rasid = model.getProperty('/i_Vencimiento');
                let oFilters = {
                    I_KNKLI:rut,
                    I_BUKRS:sociedad.BUKRS,
                    I_KKBER:sociedad.KKBER,
                    I_RASID:rasid,
                    I_VKORG:'',
                    I_VTWEG:'',
                    I_SPART:''
                };
    
    
                utils.httpCall({
                    service : "ZPWD_072_DOCTOS_MOROSOS_01",
                    query : oFilters,
                    type : "post",
                    success : function (result, status, xhr) {
                        model.setProperty('/AntecedentesFinancieros/DocumentosMorosos',result.GT_VZGITAB);
                    }
                });
            },
    
            multiplicarMontoFormatter: function(monto){
                if(typeof monto != 'undefined') {
                    let montoNumerico = parseFloat(monto);
                    let oFormat = sap.ui.core.format.NumberFormat.getIntegerInstance({
                        groupingEnabled:true
                    });
    
                    return oFormat.format(montoNumerico*100);
                }else{
                    return 0;
                }
            },
    
            morososVencidasFormatter: function(doctos){
                if(typeof doctos != 'undefined' && doctos.length > 0) {
                    let suma = doctos.reduce(function (total, value) {
                        return {SFAET: total.SFAET + value.SFAET};
                    }).SFAET;
    
                    let oFormat = sap.ui.core.format.NumberFormat.getIntegerInstance({
                        groupingEnabled:true
                    });
    
                    return oFormat.format(suma);
                }else{
                    return 0;
                }
            },
    
            morososNoVencidasFormatter: function(doctos){
                if(typeof doctos != 'undefined'  && doctos.length > 0) {
                    let suma = doctos.reduce(function (total, value) {
                        return {SNFAT: total.SNFAT + value.SNFAT};
                    }).SNFAT;
    
                    let oFormat = sap.ui.core.format.NumberFormat.getIntegerInstance({
                        groupingEnabled:true
                    });
    
                    return oFormat.format(suma);
                }else{
                    return 0;
                }
            },
    
            morososTotalFormatter: function(doctos){
                let oFormat = sap.ui.core.format.NumberFormat.getIntegerInstance({
                    groupingEnabled:true
                });
    
                let suma =  (oFormat.parse(this.morososVencidasFormatter(doctos).toString()) + oFormat.parse(this.morososNoVencidasFormatter(doctos).toString()));
    
    
                return oFormat.format(suma);
            },

            _iniciarCampos: function () {
                let oModel = this.getView().getModel();
                let that = this;

/* Jose Lopez    
                utils.httpCall({
                    service : "ZPWD_072_SD_DICCIO_CONSULTA",
                    query : {},
                    type : "post",
                    success : function (result, status, xhr) {
                        oModel.setProperty('/Sociedades',result.GT_T001);
                    }
                });
Jose Lopez     */
                var oScoModel = new sap.ui.model.json.JSONModel();
                oScoModel.loadData("model/data.json");
                oScoModel.attachRequestCompleted(function(oEvent) {
                    var t_datempr = oScoModel.getProperty("/ZPWD_072_SD_DICCIO_CONSULTA/response/GT_T001");
                    oModel.setProperty('/Sociedades',t_datempr);
                });
                oModel.setProperty('/VisibleResultado',false);
                oModel.setProperty('/AntecedentesComerciales',{
                    Detalles:{
                        Cotizaciones:[],
                        Facturas:[],
                        Ordenes:[],
                        Leasing:[]
                    }
                });

                oModel.setProperty('/AntecedentesFinancieros',{
                    ControlCreditos:{},
                    DocumentosMorosos:[],
                    Descripciones:{
                        CreditoCliente:[],
                        EquipoResponsable:[],
                        ViasPago:[],
                        CondicionPago:[]
                    }
                });
                
                oModel.setProperty('/AreasControlCredito', {});
/* Jose Lopez                
                    utils.httpCall({
                    service: "ZSD_FM_DICCIO_CONSULTA",
                    query: {},
                    type: "post",
                    success: function (result, status, xhr) {
                        oModel.setProperty('/AreasControlCredito', result.GT_T014T);
                        oModel.setProperty('/filters/ACC', {});
                         if (result.GT_T014T.length > 0) {
                                    oModel.setProperty('/filters/ACC', result.GT_T014T[0].KKBER);
                        }
                    }
                    });
Jose Lopez*/
                var oScoModel2 = new sap.ui.model.json.JSONModel();
                oScoModel2.loadData("model/data.json");
                oScoModel2.attachRequestCompleted(function(oEvent) {
                    var t_datempr = oScoModel2.getProperty("/ZSD_FM_DICCIO_CONSULTA/response/GT_T014T");
                    oModel.setProperty('/AreasControlCredito',t_datempr);
                    oModel.setProperty('/filters/ACC', {});
                    if (t_datempr.length > 0) {
                        oModel.setProperty('/filters/ACC', t_datempr.KKBER);
                    }                        
                });
            },      

 
            /**
             * Error handling
             */
            handleMessagePopoverPress: function (oEvent) {
                this._oMessagePopover.openBy(oEvent.getSource());
            },

            addMessage: function (msg, type) {
                type = type || 'e';
                switch (type.toLowerCase()) {
                    case 'w':
                        type = sap.ui.core.MessageType.Warning;
                        break;
                    case 'i':
                        type = sap.ui.core.MessageType.Information;
                        break;
                    case 'n':
                        type = sap.ui.core.MessageType.None;
                        break;
                    case 's':
                        type = sap.ui.core.MessageType.Success;
                        break;
                    case 'e':
                        type = sap.ui.core.MessageType.Error;
                        break;
                    default:
                        type = sap.ui.core.MessageType.None;
                }
                sap.ui.getCore().getMessageManager().addMessages(
                    new sap.ui.core.message.Message({
                        message: msg,
                        type
                    })
                );
                setTimeout(() => this._oMessagePopover.openBy(this.byId('errorPopover')), 3000);
            }
            


    
		});
	});
