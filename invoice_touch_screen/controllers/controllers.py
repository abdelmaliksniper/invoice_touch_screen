# -*- coding: utf-8 -*-
from odoo import http

# class BuildingInterfaceExtension(http.Controller):
#     @http.route('/building_interface_extension/building_interface_extension/', auth='public')
#     def index(self, **kw):
#         return "Hello, world"

#     @http.route('/building_interface_extension/building_interface_extension/objects/', auth='public')
#     def list(self, **kw):
#         return http.request.render('building_interface_extension.listing', {
#             'root': '/building_interface_extension/building_interface_extension',
#             'objects': http.request.env['building_interface_extension.building_interface_extension'].search([]),
#         })

#     @http.route('/building_interface_extension/building_interface_extension/objects/<model("building_interface_extension.building_interface_extension"):obj>/', auth='public')
#     def object(self, obj, **kw):
#         return http.request.render('building_interface_extension.object', {
#             'object': obj
#         })