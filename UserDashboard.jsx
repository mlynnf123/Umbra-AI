import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  User, 
  MessageSquare, 
  BarChart3, 
  Settings, 
  Crown,
  Zap,
  Calendar,
  TrendingUp
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function UserDashboard() {
  const { user, profile, signOut } = useAuth()
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      // Fetch user conversations
      const response = await fetch('/api/conversations', {
        headers: {
          'Authorization': `Bearer ${user?.access_token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setConversations(data.conversations || [])
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase() || 'U'
  }

  const getTierColor = (tier) => {
    switch (tier) {
      case 'pro': return 'bg-blue-500'
      case 'enterprise': return 'bg-purple-500'
      default: return 'bg-gray-500'
    }
  }

  const getTierIcon = (tier) => {
    switch (tier) {
      case 'pro': return <Zap className="w-3 h-3" />
      case 'enterprise': return <Crown className="w-3 h-3" />
      default: return null
    }
  }

  const usagePercentage = profile ? (profile.api_usage_count / profile.api_usage_limit) * 100 : 0

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {profile?.full_name || user?.email}
          </p>
        </div>
        <Button variant="outline" onClick={signOut}>
          Sign Out
        </Button>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="w-5 h-5" />
            <span>Profile</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback className="text-lg">
                {getInitials(profile?.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-xl font-semibold">{profile?.full_name}</h3>
              <p className="text-muted-foreground">{user?.email}</p>
              <div className="flex items-center space-x-2 mt-2">
                <Badge 
                  variant="secondary" 
                  className={`${getTierColor(profile?.subscription_tier)} text-white`}
                >
                  {getTierIcon(profile?.subscription_tier)}
                  <span className="ml-1 capitalize">{profile?.subscription_tier || 'Free'}</span>
                </Badge>
                <Badge variant="outline">
                  <Calendar className="w-3 h-3 mr-1" />
                  Joined {new Date(profile?.created_at).toLocaleDateString()}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* API Usage */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Usage</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {profile?.api_usage_count || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              of {profile?.api_usage_limit || 100} requests used
            </p>
            <Progress value={usagePercentage} className="mt-2" />
          </CardContent>
        </Card>

        {/* Conversations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversations</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversations.length}</div>
            <p className="text-xs text-muted-foreground">
              Total conversations
            </p>
          </CardContent>
        </Card>

        {/* Account Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Account Status</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Active</div>
            <p className="text-xs text-muted-foreground">
              All systems operational
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Conversations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5" />
            <span>Recent Conversations</span>
          </CardTitle>
          <CardDescription>
            Your latest writing sessions with Scriptor Umbra AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading conversations...
            </div>
          ) : conversations.length > 0 ? (
            <div className="space-y-4">
              {conversations.slice(0, 5).map((conversation) => (
                <div key={conversation.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{conversation.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {new Date(conversation.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
                    Continue
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No conversations yet. Start chatting to see them here!
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subscription Info */}
      {profile?.subscription_tier === 'free' && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-blue-700">
              <Crown className="w-5 h-5" />
              <span>Upgrade Your Plan</span>
            </CardTitle>
            <CardDescription className="text-blue-600">
              Get more API requests and advanced features with a Pro subscription
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700">
                  Current: {profile.api_usage_count}/{profile.api_usage_limit} requests used
                </p>
                <p className="text-sm text-blue-600">
                  Pro plan: 1,000 requests/month + priority support
                </p>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700">
                Upgrade Now
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
