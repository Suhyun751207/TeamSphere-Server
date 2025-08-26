import { createClient, RedisClientType } from "redis";

class RedisService {
  private client: RedisClientType;
  private isConnected: boolean = false;

  constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });

    this.client.on('error', (err) => {
      console.error('Redis Client Error:', err);
      this.isConnected = false;
    });

    this.client.on('connect', () => {
      console.log('Redis Client Connected');
      this.isConnected = true;
    });

    this.client.on('disconnect', () => {
      console.log('Redis Client Disconnected');
      this.isConnected = false;
    });
  }

  async connect(): Promise<void> {
    try {
      if (!this.isConnected) {
        await this.client.connect();
      }
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.isConnected) {
        await this.client.disconnect();
      }
    } catch (error) {
      console.error('Failed to disconnect from Redis:', error);
      throw error;
    }
  }

  getClient(): RedisClientType {
    return this.client;
  }

  isClientConnected(): boolean {
    return this.isConnected;
  }

  // 실시간 메시지 전송을 위한 Pub/Sub 메서드들
  async publishMessage(channel: string, message: any): Promise<void> {
    try {
      if (!this.isConnected) {
        throw new Error('Redis client is not connected');
      }
      await this.client.publish(channel, JSON.stringify(message));
    } catch (error) {
      console.error('Failed to publish message:', error);
      throw error;
    }
  }

  async subscribeToChannel(channel: string, callback: (message: any) => void): Promise<void> {
    try {
      if (!this.isConnected) {
        throw new Error('Redis client is not connected');
      }
      
      await this.client.subscribe(channel, (message) => {
        try {
          const parsedMessage = JSON.parse(message);
          callback(parsedMessage);
        } catch (error) {
          console.error('Failed to parse message:', error);
        }
      });
    } catch (error) {
      console.error('Failed to subscribe to channel:', error);
      throw error;
    }
  }

  async unsubscribeFromChannel(channel: string): Promise<void> {
    try {
      if (!this.isConnected) {
        throw new Error('Redis client is not connected');
      }
      await this.client.unsubscribe(channel);
    } catch (error) {
      console.error('Failed to unsubscribe from channel:', error);
      throw error;
    }
  }

  // 채팅방별 채널 이름 생성
  getRoomChannel(roomId: string): string {
    return `room:${roomId}`;
  }

  // 사용자별 채널 이름 생성
  getUserChannel(userId: number): string {
    return `user:${userId}`;
  }
}

export const redisService = new RedisService();
