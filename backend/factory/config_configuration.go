/*
 * WebUI Configuration Factory
 */

package factory

type Configuration struct {
	Mongodb *Mongodb `yaml:"mongodb"`
}
