kubeconfigFile = D:\Proyectos\Personales\MaskThe\kubeconfig.yaml

install-prometheus:
	helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
	helm install --set resources.requests.memory=256Mi monitoring prometheus-community/kube-prometheus-stack

uninstall-prometheus:
	helm uninstall monitoring

install-prometheus-prod:
	helm --kubeconfig=${kubeconfigFile} repo add prometheus-community https://prometheus-community.github.io/helm-charts
	helm --kubeconfig=${kubeconfigFile} install --set resources.requests.memory=256Mi monitoring prometheus-community/kube-prometheus-stack

uninstall-prometheus-prod:
	helm --kubeconfig=${kubeconfigFile} uninstall monitoring

deploy-minikube:
	pulumi stack select dev
	kubectl apply -f ./crd/traefik
	kubectl apply -f ./crd/rabbitmq
	pulumi up -y

deploy-prod:
	pulumi stack select prod
	kubectl --kubeconfig=${kubeconfigFile} apply -f ./crd/traefik
	kubectl --kubeconfig=${kubeconfigFile} apply -f ./crd/rabbitmq
	pulumi up -y

destroy-prod:
	pulumi stack select prod
	pulumi destroy -y
	kubectl --kubeconfig=${kubeconfigFile} delete -f ./crd/traefik
	kubectl --kubeconfig=${kubeconfigFile} delete -f ./crd/rabbitmq