/*

 * WebUi Configuration Factory

 */

package factory

type Config struct {
	Info          *Info          `yaml:"info"`
	Configuration *Configuration `yaml:"configuration"`
}

type Info struct {
	Version     string `yaml:"version,omitempty"`
	Description string `yaml:"description,omitempty"`
}

type Configuration struct {
	WebServer *WebServer `yaml:"WebServer,omitempty"`
	Mongodb   *Mongodb   `yaml:"mongodb"`
}

type WebServer struct {
	Scheme string `yaml:"scheme"`
	IP     string `yaml:"ipv4Address"`
	PORT   string `yaml:"port"`
}

type Mongodb struct {
	Name string `yaml:"name"`
	Url  string `yaml:"url"`
}
