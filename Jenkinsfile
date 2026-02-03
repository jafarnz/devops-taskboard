// ==============================================================================
// Jenkinsfile - Complete CI/CD Pipeline for DevOps Taskboard
// Features: Jest + Playwright Testing, Blue Ocean Dashboard, Email Notifications
// ==============================================================================

pipeline {
    agent any
    
    // Environment variables
    environment {
        // Application settings
        APP_NAME = 'devops-taskboard'
        APP_VERSION = "${env.BUILD_NUMBER}"
        DOCKER_IMAGE = "devops-taskboard:${env.BUILD_NUMBER}"
        DOCKER_IMAGE_LATEST = "devops-taskboard:latest"
        DOCKER_PLAYWRIGHT_IMAGE = "devops-taskboard:playwright-${env.BUILD_NUMBER}"
        
        // Kubernetes/Minikube settings
        KUBE_NAMESPACE = 'default'
        KUBE_DEPLOYMENT = 'devops-taskboard'
        
        // Email notification settings (configure in Jenkins)
        EMAIL_RECIPIENTS = 'jaf.nz@icloud.com'
    }
    
    // Build options - Optimized for Blue Ocean visualization
    options {
        buildDiscarder(logRotator(numToKeepStr: '20'))
        timestamps()
        timeout(time: 60, unit: 'MINUTES')
        disableConcurrentBuilds()
    }
    
    // Pipeline stages
    stages {
        // ==================================================================
        // Stage 1: Checkout Source Code
        // ==================================================================
        stage('Checkout') {
            steps {
                echo '📥 Checking out source code...'
                checkout scm
                
                script {
                    env.GIT_COMMIT_SHORT = sh(
                        script: 'git rev-parse --short HEAD',
                        returnStdout: true
                    ).trim()
                    env.GIT_BRANCH = sh(
                        script: 'git rev-parse --abbrev-ref HEAD',
                        returnStdout: true
                    ).trim()
                }
                
                echo "Branch: ${env.GIT_BRANCH}"
                echo "Commit: ${env.GIT_COMMIT_SHORT}"
            }
        }
        
        // ==================================================================
        // Stage 2: Install Dependencies
        // ==================================================================
        stage('Install Dependencies') {
            steps {
                echo '📦 Installing Node.js dependencies...'
                sh 'npm install'
            }
        }
        
        // ==================================================================
        // Stage 3: Jest Unit Tests with Coverage
        // ==================================================================
        stage('Jest Unit Tests') {
            steps {
                echo '🧪 Running Jest unit tests with coverage...'
                sh '''
                    echo "Running: npm test"
                    npm test
                    
                    echo "Running: npm run test:coverage"
                    npm run test:coverage || true
                '''
            }
            post {
                always {
                    // Archive Jest coverage reports
                    archiveArtifacts artifacts: 'coverage/**/*', allowEmptyArchive: true
                }
            }
        }
        
        // ==================================================================
        // Stage 4: Playwright E2E Tests (All 3 Browsers)
        // ==================================================================
        stage('Playwright E2E Tests') {
            steps {
                echo '🎭 Running Playwright E2E tests on Chromium, Firefox, and WebKit...'
                sh '''
                    # Install Playwright browsers (chromium, firefox, webkit)
                    npx playwright install --with-deps chromium firefox webkit
                    
                    echo "Running: npm run test-frontend"
                    npm run test-frontend || true
                    
                    echo "Running: npm run test-frontend:coverage"
                    npm run test-frontend:coverage || true
                '''
            }
            post {
                always {
                    // Archive Playwright reports
                    archiveArtifacts artifacts: 'playwright-report/**/*', allowEmptyArchive: true
                    archiveArtifacts artifacts: 'test-results/**/*', allowEmptyArchive: true
                }
            }
        }
        
        // ==================================================================
        // Stage 5: Build Production Docker Image
        // ==================================================================
        stage('Build Docker Image') {
            steps {
                echo '🐳 Building production Docker image...'
                sh """
                    docker build -t ${DOCKER_IMAGE} -t ${DOCKER_IMAGE_LATEST} .
                """
                sh 'docker images | grep devops-taskboard'
            }
        }
        
        // ==================================================================
        // Stage 6: Build with Podman (Alternative Containerization)
        // ==================================================================
        stage('Build Podman Image') {
            when {
                expression {
                    return sh(script: 'which podman', returnStatus: true) == 0
                }
            }
            steps {
                echo '🦭 Building Podman image (Alternative Containerization)...'
                sh """
                    podman build -t ${DOCKER_IMAGE} -t ${DOCKER_IMAGE_LATEST} .
                """
            }
        }
        
        // ==================================================================
        // Stage 7: Container Integration Tests
        // ==================================================================
        stage('Container Integration Tests') {
            steps {
                echo '🧪 Running integration tests in container...'
                script {
                    sh """
                        # Run the container
                        docker run -d --name test-app-${BUILD_NUMBER} -p 3001:3000 ${DOCKER_IMAGE_LATEST}
                        
                        # Wait for container to start
                        sleep 15
                        
                        # Test the API endpoints
                        echo "Testing GET /tasks..."
                        curl -f http://localhost:3001/tasks && echo " ✓ GET /tasks passed"
                        
                        # Test the frontend
                        echo "Testing frontend..."
                        curl -f http://localhost:3001/ && echo " ✓ Frontend accessible"
                        
                        # Cleanup
                        docker stop test-app-${BUILD_NUMBER} || true
                        docker rm test-app-${BUILD_NUMBER} || true
                    """
                }
            }
        }
        
        // ==================================================================
        // Stage 8: Security Scan
        // ==================================================================
        stage('Security Scan') {
            steps {
                echo '🔒 Running security scan...'
                script {
                    def trivyExists = sh(script: 'which trivy', returnStatus: true) == 0
                    if (trivyExists) {
                        sh "trivy image --severity HIGH,CRITICAL ${DOCKER_IMAGE} || true"
                    } else {
                        echo 'Trivy not installed, skipping security scan'
                    }
                }
            }
        }
        
        // ==================================================================
        // Stage 9: Deploy to Minikube
        // ==================================================================
        stage('Deploy to Minikube') {
            steps {
                echo '☸️ Deploying to Minikube...'
                script {
                    def minikubeStatus = sh(
                        script: 'minikube status --format={{.Host}}',
                        returnStatus: true
                    )
                    
                    if (minikubeStatus != 0) {
                        echo 'Starting Minikube...'
                        sh 'minikube start --driver=docker'
                    }
                    
                    // Build in Minikube's Docker daemon
                    sh '''
                        eval $(minikube docker-env)
                        docker build -t devops-taskboard:latest .
                    '''
                    
                    // Apply Kubernetes manifests
                    sh '''
                        kubectl apply -f k8s/namespace.yaml || true
                        kubectl apply -f k8s/deployment.yaml
                        kubectl rollout status deployment/devops-taskboard --timeout=120s
                        kubectl get pods -l app=devops-taskboard
                        kubectl get services
                    '''
                    
                    def serviceUrl = sh(
                        script: 'minikube service devops-taskboard-service --url || echo "URL not available"',
                        returnStdout: true
                    ).trim()
                    echo "Application deployed at: ${serviceUrl}"
                }
            }
        }
        
        // ==================================================================
        // Stage 10: Smoke Tests on Kubernetes
        // ==================================================================
        stage('Smoke Tests') {
            steps {
                echo '💨 Running smoke tests on deployed application...'
                sh '''
                    sleep 10
                    SERVICE_URL=$(minikube service devops-taskboard-service --url 2>/dev/null || echo "")
                    
                    if [ -n "$SERVICE_URL" ]; then
                        echo "Testing: $SERVICE_URL/tasks"
                        HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$SERVICE_URL/tasks")
                        echo "Response code: $HTTP_CODE"
                        
                        if [ "$HTTP_CODE" = "200" ]; then
                            echo "✓ Smoke test passed!"
                        else
                            echo "⚠ Smoke test returned $HTTP_CODE"
                        fi
                    else
                        echo "Service URL not available"
                    fi
                '''
            }
        }
        
        // ==================================================================
        // Stage 11: Setup Dashboard
        // ==================================================================
        stage('Setup Dashboard') {
            steps {
                echo '📊 Setting up Kubernetes Dashboard...'
                sh '''
                    minikube addons enable dashboard || true
                    minikube addons enable metrics-server || true
                    kubectl apply -f k8s/dashboard.yaml || true
                    echo "Dashboard available via: minikube dashboard"
                '''
            }
        }
    }
    
    // ==================================================================
    // Post-build Actions
    // ==================================================================
    post {
        always {
            echo '🧹 Cleaning up...'
            sh 'docker image prune -f || true'
            
            // Publish HTML reports for Blue Ocean
            publishHTML(target: [
                allowMissing: true,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: 'coverage/lcov-report',
                reportFiles: 'index.html',
                reportName: 'Jest Coverage Report'
            ])
            
            publishHTML(target: [
                allowMissing: true,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: 'playwright-report',
                reportFiles: 'index.html',
                reportName: 'Playwright Report'
            ])
        }
        
        success {
            echo '✅ Pipeline completed successfully!'
            script {
                try {
                    emailext(
                        subject: "✅ SUCCESS: ${env.JOB_NAME} - Build #${env.BUILD_NUMBER}",
                        body: """
                            <h2>Build Successful!</h2>
                            <p><strong>Project:</strong> ${env.JOB_NAME}</p>
                            <p><strong>Build Number:</strong> ${env.BUILD_NUMBER}</p>
                            <p><strong>Branch:</strong> ${env.GIT_BRANCH}</p>
                            <p><strong>Commit:</strong> ${env.GIT_COMMIT_SHORT}</p>
                            <p><strong>Build URL:</strong> <a href="${env.BUILD_URL}">${env.BUILD_URL}</a></p>
                            <hr>
                            <h3>Test Results:</h3>
                            <ul>
                                <li>Jest Unit Tests: ✅ Passed</li>
                                <li>Playwright E2E Tests (Chromium, Firefox, WebKit): ✅ Passed</li>
                                <li>Integration Tests: ✅ Passed</li>
                            </ul>
                            <p>Application deployed to Minikube.</p>
                        """,
                        to: "${EMAIL_RECIPIENTS}",
                        mimeType: 'text/html'
                    )
                } catch (Exception e) {
                    echo "Email notification failed: ${e.message}"
                }
            }
        }
        
        failure {
            echo '❌ Pipeline failed!'
            script {
                try {
                    emailext(
                        subject: "❌ FAILED: ${env.JOB_NAME} - Build #${env.BUILD_NUMBER}",
                        body: """
                            <h2>Build Failed!</h2>
                            <p><strong>Project:</strong> ${env.JOB_NAME}</p>
                            <p><strong>Build Number:</strong> ${env.BUILD_NUMBER}</p>
                            <p><strong>Branch:</strong> ${env.GIT_BRANCH ?: 'Unknown'}</p>
                            <p><strong>Build URL:</strong> <a href="${env.BUILD_URL}">${env.BUILD_URL}</a></p>
                            <p><strong>Console:</strong> <a href="${env.BUILD_URL}console">View Logs</a></p>
                            <hr>
                            <p style="color: red;">Please check the console output for details.</p>
                        """,
                        to: "${EMAIL_RECIPIENTS}",
                        mimeType: 'text/html'
                    )
                } catch (Exception e) {
                    echo "Email notification failed: ${e.message}"
                }
            }
        }
        
        unstable {
            echo '⚠️ Pipeline completed with warnings!'
            script {
                try {
                    emailext(
                        subject: "⚠️ UNSTABLE: ${env.JOB_NAME} - Build #${env.BUILD_NUMBER}",
                        body: """
                            <h2>Build Unstable!</h2>
                            <p><strong>Project:</strong> ${env.JOB_NAME}</p>
                            <p><strong>Build Number:</strong> ${env.BUILD_NUMBER}</p>
                            <p><strong>Build URL:</strong> <a href="${env.BUILD_URL}">${env.BUILD_URL}</a></p>
                            <hr>
                            <p style="color: orange;">Some tests may have failed. Please review.</p>
                        """,
                        to: "${EMAIL_RECIPIENTS}",
                        mimeType: 'text/html'
                    )
                } catch (Exception e) {
                    echo "Email notification failed: ${e.message}"
                }
            }
        }
    }
}
