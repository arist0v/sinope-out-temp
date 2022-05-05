from email.mime import application
import os
import sys

sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), "lib"))
from gateway_addon import APIHandler, APIResponse, Database
import functools
import json

print = functools.partial(print, flush=True)

_TIMEOUT = 3
_CONFIG_PATH = [
    os.path.join(os.path.expanduser('~'), '.webthings', 'config'),
]
_DATA_PATH = os.path.join(os.path.expanduser('~'), '.webthings', 'data')

if 'WEBTHINGS_HOME' in os.environ:
    _CONFIG_PATH.insert(0, os.path.join(os.environ['WEBTHINGS_HOME'], 'config'))

class SinopeAPIHandler(APIHandler):

    def __init__(self, verbose=False):
        self.availablePath = ['/save_links',
        '/load_links',]
        self.addon_name = 'sinope-out-temp'
        self.running = True
        self.ready = False

        self.api_server = 'http://127.0.0.1:8080'
        self.DEBUG = True #TODO: use config debug_mode

        try:
            print("Trying my best")
            manifest_fname = os.path.join(
                os.path.dirname(__file__),
                '..',
                'manifest.json'
            )

            with open(manifest_fname, 'rt') as f:
                manifest = json.load(f)
                if self.DEBUG:
                    print(manifest)

            self.id = manifest['id']
                    
            APIHandler.__init__(self, manifest['id'], verbose=self.DEBUG)
            self.manager_proxy.add_api_handler(self)

            if self.DEBUG:
                print("self.manager_proxy = " + str(self.manager_proxy))
                print("Created new API HANDLER: " + str(manifest['id']))

        except Exception as e:
            print("Failed to init ux extension API handler: " + str(e))
        self.ready = True

    def handle_request(self, request):
        try:
            if request.method != 'POST':
                print("ERROR: not POST")
                return APIResponse(status=404)


            if request.path in self.availablePath:
                if request.path == '/save_links':
                    links = request.body['links']

                    self.save_links(links)
                    return APIResponse(
                        status=200,
                        content_type='application/json',
                        content=json.dumps({'state':'ok'})
                    )

                elif request.path == '/load_links':
                    links = self.load_links()
                    
                    return APIResponse(
                        status=200,
                        content_type='application/json',
                        content=json.dumps({'state':'ok','links':links}),
                    )

                else:
                    return APIResponse(
                        status=500,
                        content_type='application/json',
                        content=json.dumps({'state':"Please Wait a few seconds, the addon has not fully loaded yet"}),
                    )
            else:
                print("ERROR: PATH NOT FOUND")
                return APIResponse(status=404)

        except Exception as e:
            print(f"ERROR first TRY : {e}")
            return APIResponse(
                status=500,
                content_type='application/json',
                content=json.dumps({"state":"API Error"}),
            )

    def load_links(self):
        with open(os.path.join(_DATA_PATH, self.id, 'links.str'), 'rb') as file:
            if not file:
                print(f'Error opening file to read')
                return
            links = file.readlines()
            if len(links) > 0:
                return links
            else:
                return "None"

    def save_links(self, data):
        print(f'BODY: {data}')
        print(type(data))
        with open (os.path.join(_DATA_PATH, self.id, 'links.str'),'wb') as file:
            if not file:
                print(f'Error opening file for storage')
                return
            file.write(data)
