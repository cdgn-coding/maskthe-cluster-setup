kubeconfigFile = D:\Proyectos\Personales\MaskThe\kubeconfig.yaml

install:
	helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
	helm install --set adminPassword=admin --set resources.requests.memory=256Mi monitoring prometheus-community/kube-prometheus-stack

setup:
	kubectl apply -f ./crd/traefik
	kubectl apply -f ./crd/rabbitmq

setup-prod:
	kubectl --kubeconfig=${kubeconfigFile} apply -f ./crd/traefik
	kubectl --kubeconfig=${kubeconfigFile} apply -f ./crd/rabbitmq

install-prod:
	helm --kubeconfig=${kubeconfigFile} repo add prometheus-community https://prometheus-community.github.io/helm-charts
	helm --kubeconfig=${kubeconfigFile} install --set adminPassword=admin --set resources.requests.memory=256Mi monitoring prometheus-community/kube-prometheus-stack

deploy:
	pulumi up -y