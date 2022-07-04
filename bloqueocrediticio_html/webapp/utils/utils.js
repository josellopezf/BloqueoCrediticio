sap.ui.define([
    "sap/m/MessageBox"
], function (MessageBox) {
    "use strict";

    return {
        _pendingRequests: 0,

        httpCall: function (params) {
            let that = this;
            that._pendingRequests++;
            that.view.setBusy(true);

            params.query = params.query ? params.query : {};
            params.query.format = 'json';
            params.query['sap-language'] = 'ES';

            let url = "/SalfaCloud/" + params.service;

            // Para testing local
            if (!window.location.href.includes('https')) {
                url = "https://flpnwc-d69a1fd3a.dispatcher.us2.hana.ondemand.com/sap/fiori/template" + url;
            }

            return $.ajax({
                url: url,
                contentType: 'application/json',
                headers: params.headers ? params.headers : {},
                type: params.type ? params.type : "GET",
                dataType: params.dataType ? params.dataType : "JSON",
                async: params.async === undefined ? true : params.async,
                data: params.type && params.type.toLowerCase() === 'post' ? JSON.stringify(params.query) : params.query,
                error: params.error ? params.error : function (e) {
                    try {
                        if (e.getResponseHeader('com.sap.cloud.security.login') === 'login-request') {
                            MessageBox.confirm("La sesión ha expirado. Haga click en ok para actualizar la página", {
                                title: 'Sesión expirada',
                                onClose: (a) => a === 'OK' ? location.reload() : null
                            });
                        } else {
                            MessageBox.error("Se ha producido un error al comunicarse con los servicios de Backend. \n\n Código HTTP " + e.responseJSON.ERROR_CODE + " - " + e.responseJSON.ERROR_MESSAGE);
                        }
                    }
                    catch (err) {
                        MessageBox.error("No ha podido comunicarse con los servicios de SCP");
                    }
                }
            }).always(function () {
                that._pendingRequests--;
                if (that._pendingRequests === 0) {
                    that.view.setBusy(false);
                }
            }).done(params.success);
        },

        openPdfFromBase64:function(base64){
            let byteCharacters = atob(base64);
            let byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            let byteArray = new Uint8Array(byteNumbers);
            let file = new Blob([byteArray], {type: 'application/pdf'});
            let fileURL = URL.createObjectURL(file);
            window.open(fileURL);
        },

        /**
         * Hace un group by de objetos
         * @param list array de objetos
         * @param keyGetter clave por la que agrupar
         * @returns un objeto con keyGetter como claves y arrays de objetos de list como valor
         */
        groupBy(list, keyGetter) {
            const map = {};
            list.forEach((item) => {
                const key = keyGetter(item);
                const collection = map[key];
                if (!collection) {
                    map[key] = [item];
                } else {
                    collection.push(item);
                }
            });
            return map;
        },

        /**
         * Crea un dialogo que muestra una tabla con datos
         * @param model el modelo con los datos a mostrar
         * @param title el titulo de la tabla
         * @param columns de la forma {header, bind}
         * @param selectionMode el modo de seleccion de la tabla
         * @param tableParams otros parametros de la tabla
         * @param columns array con objetos de la forma {header: <titulo columna>, bind: <atributo del modelo>}
         */
        openTableDialog: function (model, title, columns, selectionMode, tableParams) {
            let that = this;
            let ctrl = this.controller;
            tableParams = tableParams || {};
            if (ctrl.tableDialog) {
                ctrl.tableDialog.destroy()
            }
            ctrl.tableDialog = new sap.m.Dialog({
                title: title,
                content: new sap.ui.table.Table(Object.assign(tableParams, {
                    rows: '{/' + model + '}',
                    selectionMode: selectionMode || "None",
                    columns: columns.map((c) =>
                        new sap.ui.table.Column({
                            label: new sap.m.Label({
                                text: c.header
                            }),
                            template: new sap.m.Text({
                                text: '{' + c.bind + '}'
                            }),
                            sortProperty: c.bind,
                            filterProperty: c.bind
                        })
                    ),
                })).setModel(that.view.getModel()),
                beginButton: new sap.m.Button({
                    text: 'Cerrar',
                    press: function () {
                        ctrl.tableDialog.close();
                    }.bind(that)
                })
            });
            ctrl.tableDialog.open();
        },

        getUserData: function (success) {
            let user = this.getUser();

            // carga de localstorage y se fija que sea del mismo usuario para cuando se loguea otro. si esta bien, retorna eso
            let rawUserData = localStorage['userData'];
            if (rawUserData) {
                let userData = JSON.parse(rawUserData);
                if (userData['E_USUARIO'] && userData['E_USUARIO']['ID_USUARIO'] === user) {
                    success(userData);
                    return;
                }
            }

            let that = this;
            // si no esta en local storage o lo que hay es de otro usuario, busca lo nuevo
            this.httpCall({
                service: 'ZPWD_004_DATUSER',
                query: {'I_IDUSER': user},
                success: resp => {
                    if (resp.E_RETORNO.TYPE === 'E') {
                        MessageBox.warning("No se encuentra el usuario " + user, {
                            title: 'Información',
                            onClose: () => that.navToLaunchpad()
                        });
                    } else {
                        //se filtran solo los activos
                        resp.T_DATEMPR = resp.T_DATEMPR.filter(x => x.ESTADO === 'A');
                        resp.T_GRUPOS = resp.T_GRUPOS.filter(x => x.ESTADO === 'A');
                        resp.T_ROLES = resp.T_ROLES.filter(x => x.ESTADO === 'A');

                        localStorage['userData'] = JSON.stringify(resp);
                        success(resp);
                    }
                }
            });
        },

        navToLaunchpad: function () {
            location.href = location.href.split('#')[0] + '#Shell-home';
        },

        getUser: function () {
            if (!this.user) {
                var that = this,
                    url = "/services/userapi/currentUser";

                // Para testing local
                if (!window.location.href.includes('https')) {
                    url = "https://flpnwc-d69a1fd3a.dispatcher.us2.hana.ondemand.com/sap/fiori/template" + url;
                }
                $.ajax({
                    contentType: 'application/json',
                    headers: {},
                    type: "GET",
                    async: false,
                    url: url,
                    error: function (e) {
                        MessageBox.error("No ha podido obtener los datos de usuario");
                    },
                    success: function (result, status, xhr) {
                        that.user = result.name.toUpperCase();
                    }
                });
            }

            return this.user;
        },

        dateToFormat: function (format, d) {
            d = d || new Date();
            let yyyy = d.getFullYear(),
                MM = ('0' + (d.getMonth() + 1)).slice(-2),
                dd = ('0' + d.getDate()).slice(-2);
            switch (format) {
                case 'yyyyMMdd':
                    return yyyy + MM + dd;
                case 'dd/MM/yyyy':
                    return `${dd}/${MM}/${yyyy}`;
                default:
                    return `${dd}/${MM}/${yyyy}`;
            }
        },

        dateFromFormat: function (d, format) {
            switch (format) {
                case 'yyyyMMdd':
                    return new Date(d.substr(0, 4), d.substr(4, 2) - 1, d.substr(6, 2));
                case 'yyyy-MM-dd':
                    return new Date(d.substr(0, 4), d.substr(5, 2) - 1, d.substr(8, 2));
                default:
                    return new Date(d.substr(0, 4), d.substr(4, 2) - 1, d.substr(6, 2));
            }
        },

        dateFormatToFormat: function (d, from, to) {
            return this.dateToFormat(to, this.dateFromFormat(d, from));
        },

        genericMathcodeSearch: function (success, SHLPNAME, SELOPT, campoCodigo, campoDescripcion, descripcionAdicional) {
            SELOPT = Array.isArray(SELOPT) ? SELOPT : [SELOPT];

            this.httpCall({
                service: 'Zfdt_Rfc_F4If_Select_Values',
                type: 'post',
                query: {
                    'CALL_SHLP_EXIT': '',//siempre asi
                    'MAXROWS': '',//siempre asi
                    'SORT': 'X',//siempre asi
                    'SHLP': {
                        'SHLPNAME': "H_TVBUR",
                        'SHLPTYPE': 'SH', //siempre asi
                        'SELOPT': SELOPT,
                    }
                },
                success: data => {
                    let infoCodigo = data.RECDESCR_TAB.find((r) => r.FIELDNAME === campoCodigo);
                    let offsetCodigo = parseInt(infoCodigo.OFFSET);
                    let lengthCodigo = parseInt(infoCodigo.LENG);

                    let infoDesc = data.RECDESCR_TAB.find((r) => r.FIELDNAME === campoDescripcion);
                    let offsetDesc = parseInt(infoDesc.OFFSET);
                    let lengthDesc = parseInt(infoDesc.LENG);

                    if (descripcionAdicional) {
                        let infoDescAdicional = data.RECDESCR_TAB.find((r) => r.FIELDNAME === descripcionAdicional);
                        var offsetDescAdicional = parseInt(infoDescAdicional.OFFSET);
                        var lengthDescAdicional = parseInt(infoDescAdicional.LENG);
                    }

                    success(data.RECORD_TAB.map(d => {
                        return {
                            code: d.STRING.slice(offsetCodigo, offsetCodigo + lengthCodigo),
                            description: d.STRING.slice(offsetDesc, offsetDesc + lengthDesc),
                            additionalDescription: descripcionAdicional ? d.STRING.slice(offsetDescAdicional, offsetDescAdicional + lengthDescAdicional) : null
                        }
                    }));
                }
            });
        }
    };
});