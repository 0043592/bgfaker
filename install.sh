printf "NODE_ENV=production\n" >.env

distribution=$(lsb_release --id)
version=$(lsb_release -cs)
# ubuntu Setup
if [[ "$distribution" == *"Ubuntu"* ]]; then
  docker_install_url=https://download.docker.com/linux/ubuntu
elif [[ $distribution == *"Debian"* ]]; then
  docker_install_url=https://download.docker.com/linux/debian
else

  # No matching version found
  echo "Install for system $distribution, $version is not supported"
  exit 1
fi
sudo apt update && sudo apt install --no-install-recommends --no-install-suggests -y apt-transport-https ca-certificates curl gnupg lsb-release

# https://docs.docker.com/engine/install
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --batch --yes --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
sudo echo \
  "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] $docker_install_url \
    $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list >/dev/null

sudo apt update && sudo apt install -y docker-ce docker-ce-cli containerd.io &&
  sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose &&
  sudo chmod +x /usr/local/bin/docker-compose

docker-compose up -d --build
