# -*- coding: utf-8 -*-
{
    'name': "Create Customer Invoice TouchScreen",

    'summary': """Create Customer Invoice Using TouchScreen.
        """,

    'description': """
        
    """,

    'author': "Abdelmalik Yousif",
    'sequence': 1,
    'website': "",
    'category': 'Generic Modules',
    'version': '1.0',
    'currency': 'EUR',
    'price': 95.0,
    'depends': ['base', 'account'],
    'data': [
        'views/malik_view.xml',
        'data/data.xml',
    ],
    'images': [
        'static/description/product_select.png',
    ],

    'demo': [
        #'demo/demo.xml',
    ],
    'qweb': ['static/src/xml/malik.xml'],
    'installable': True,
    'application': False,
    'auto_install': False,
}
