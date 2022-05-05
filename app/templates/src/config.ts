export interface ConfigApiI {
    version: string;
    port: number;
    security: { [username: string]: string };
}

export interface ConfigLogI {
    level: 'debug' | 'info' | 'warn' | 'error';
    color: boolean;
}

<% if (database) { %>
export interface ConfigDB {
    queryAlertTime: number;
    <% if(database === 'sqlite') { %>
    location: string;
    <% } else if(database === 'oracle') { %>
    connectionsString: string;
    user: string;
    password: string;
    maxConnections: string;
    <% } else if(database === 'postgresql') { %>
    db: string;
    host: string;
    port: number;
    user: string;
    password: string;
    maxConnections;
    <% } %>
}
<% } %>