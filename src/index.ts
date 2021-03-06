import { config } from './config';
import * as App from './app';
import * as fs from 'fs';
import { IPListItem } from './models';
import { debounceTime } from 'rxjs/operators';

/**
 * Asynchronous application bootstrap
 */
export async function init() {
    try {
        // Instantiate and register app services
        App.initServices(config);

        // Instantiate and configure web server
        const server = App.initServer(config);
        App.initServerRoutes(server);
        App.initServerErrorHandler(server);

        // Start IP List service
        const iplist = App.getServices().iplist;

        // Hook a logger to the IP list change observable
        iplist.getListChange().subscribe((list) => {
            console.log(
                '(' + new Date().toUTCString() + ') ' +
                'IP List Changed: ', list
            );
        });

        // Hook a state file writer to the IP list change observable
        iplist.getListChange().pipe(debounceTime(1000)).subscribe((list) => {
            fs.writeFile(listPath, Buffer.from(JSON.stringify(list)), (err) => {
                if (err) {
                    console.log(
                        '(' + new Date().toUTCString() + ') ' +
                        'Error saving state to \'' + listPath + '\'', err
                    );
                }
            });
        });

        // Hook a NGINX conf writer to the IP list change observable
        let nginxPath = config.fileDir + 'nginx.conf';
        iplist.getListChange().pipe(debounceTime(1000)).subscribe((list) => {
            fs.writeFile(nginxPath, list.map(x => ((x.allow) ? 'allow ' : 'deny ') + x.ip + ';').join("\n"), (err) => {
                if (err) {
                    console.log(
                        '(' + new Date().toUTCString() + ') ' +
                        'Error saving NGINX conf file to \'' + nginxPath + '\'', err
                    );
                }
            });
        });

        // Try to load IP list state file
        let list: IPListItem[] = [];
        let listPath = config.fileDir + 'iplist.json';
        if (fs.existsSync(listPath))
        {
            try {
                let data = fs.readFileSync(listPath);
                if (data.length > 0) {
                    list = JSON.parse(data.toString());
                }
            }
            catch (err) {
            }
        }

        // Start IP list with the loaded data
        console.log(
            '(' + new Date().toUTCString() + ') ' +
            'Starting IP list service with data', list
        );
        iplist.start(list);

        // Start web server
        server.listen(Number(config.port) || 8080, config.host || 'localhost');
    }
    catch(e) {
        console.log(e, 'An error occured while initializing application');
    }
}

init();
